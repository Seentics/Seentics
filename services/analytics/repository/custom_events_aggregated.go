package repository

import (
	"analytics-app/models"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog"
)

type CustomEventsAggregatedRepository struct {
	db     *pgxpool.Pool
	logger zerolog.Logger
}

func NewCustomEventsAggregatedRepository(db *pgxpool.Pool, logger zerolog.Logger) *CustomEventsAggregatedRepository {
	return &CustomEventsAggregatedRepository{
		db:     db,
		logger: logger,
	}
}

// UpsertCustomEvent creates or updates a custom event aggregation
func (r *CustomEventsAggregatedRepository) UpsertCustomEvent(ctx context.Context, event *models.Event) error {
	if event.EventType == "pageview" || event.EventType == "session_start" || event.EventType == "session_end" {
		// Don't aggregate system events
		return nil
	}

	// Create event signature from properties
	signature := r.createEventSignature(event.EventType, event.Properties)

	// Prepare properties JSON
	var propertiesJSON []byte
	if event.Properties != nil {
		var err error
		propertiesJSON, err = json.Marshal(event.Properties)
		if err != nil {
			r.logger.Error().Err(err).Msg("Failed to marshal properties for aggregation")
			return err
		}
	}

	// Use UPSERT (INSERT ... ON CONFLICT ... DO UPDATE)
	query := `
		INSERT INTO custom_events_aggregated (
			website_id, event_type, event_signature, count, sample_properties, 
			first_seen, last_seen, created_at, updated_at
		) VALUES ($1, $2, $3, 1, $4, $5, $5, $5, $5)
		ON CONFLICT (website_id, event_signature) 
		DO UPDATE SET 
			count = custom_events_aggregated.count + 1,
			last_seen = $5,
			updated_at = $5,
			sample_properties = CASE 
				WHEN custom_events_aggregated.last_seen < $5 THEN $4
				ELSE custom_events_aggregated.sample_properties
			END
	`

	now := time.Now()
	_, err := r.db.Exec(ctx, query,
		event.WebsiteID,
		event.EventType,
		signature,
		propertiesJSON,
		now,
	)

	if err != nil {
		r.logger.Error().Err(err).
			Str("website_id", event.WebsiteID).
			Str("event_type", event.EventType).
			Str("signature", signature).
			Msg("Failed to upsert custom event aggregation")
		return err
	}

	r.logger.Debug().
		Str("website_id", event.WebsiteID).
		Str("event_type", event.EventType).
		Str("signature", signature).
		Msg("Custom event aggregated successfully")

	return nil
}

// GetCustomEventStats returns aggregated custom event statistics
func (r *CustomEventsAggregatedRepository) GetCustomEventStats(ctx context.Context, websiteID string, days int) ([]models.CustomEventStat, error) {
	query := `
		SELECT 
			event_type,
			SUM(count) as total_count,
			sample_properties
		FROM custom_events_aggregated
		WHERE website_id = $1 
		AND last_seen >= NOW() - INTERVAL '1 day' * $2
		GROUP BY event_type, sample_properties
		ORDER BY total_count DESC
		LIMIT 50
	`

	rows, err := r.db.Query(ctx, query, websiteID, days)
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	var events []models.CustomEventStat
	for rows.Next() {
		var event models.CustomEventStat
		var propertiesJSON []byte

		err := rows.Scan(&event.EventType, &event.Count, &propertiesJSON)
		if err != nil {
			r.logger.Warn().Err(err).Msg("Failed to scan custom event stat")
			continue
		}

		// Parse sample properties
		if len(propertiesJSON) > 0 {
			var properties models.Properties
			if err := json.Unmarshal(propertiesJSON, &properties); err == nil {
				event.SampleProperties = properties
				event.SampleEvent = properties
				event.CommonProperties = r.extractCommonProperties(properties)
			}
		}

		events = append(events, event)
	}

	return events, rows.Err()
}

// createEventSignature creates a unique signature for an event based on its type and properties
func (r *CustomEventsAggregatedRepository) createEventSignature(eventType string, properties models.Properties) string {
	// Create a deterministic signature from event type and key properties
	signatureData := []string{eventType}

	if properties != nil {
		// Sort keys for consistent hashing
		var keys []string
		for key := range properties {
			keys = append(keys, key)
		}
		sort.Strings(keys)

		// Add key-value pairs to signature
		for _, key := range keys {
			value := properties[key]
			if value != nil {
				signatureData = append(signatureData, fmt.Sprintf("%s:%v", key, value))
			}
		}
	}

	// Create hash of the signature data
	hash := sha256.Sum256([]byte(strings.Join(signatureData, "|")))
	return hex.EncodeToString(hash[:])
}

// extractCommonProperties extracts common property keys from sample properties
func (r *CustomEventsAggregatedRepository) extractCommonProperties(props models.Properties) models.Properties {
	if props == nil {
		return models.Properties{}
	}

	// For now, return the sample properties as common properties
	// In a more sophisticated implementation, you could analyze multiple events
	// and find properties that appear in most events of the same type
	return props
}

// CleanupOldEvents removes old aggregated events (optional cleanup)
func (r *CustomEventsAggregatedRepository) CleanupOldEvents(ctx context.Context, olderThanDays int) error {
	query := `
		DELETE FROM custom_events_aggregated 
		WHERE last_seen < NOW() - INTERVAL '1 day' * $1
	`

	result, err := r.db.Exec(ctx, query, olderThanDays)
	if err != nil {
		return fmt.Errorf("cleanup failed: %w", err)
	}

	rowsAffected := result.RowsAffected()
	r.logger.Info().
		Int64("rows_deleted", rowsAffected).
		Int("older_than_days", olderThanDays).
		Msg("Cleaned up old aggregated custom events")

	return nil
}
