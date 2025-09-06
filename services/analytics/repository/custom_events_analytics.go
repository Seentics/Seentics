package repository

import (
	"analytics-app/models"
	"context"
	"encoding/json"

	"github.com/jackc/pgx/v5/pgxpool"
)

type CustomEventsAnalytics struct {
	db *pgxpool.Pool
}

func NewCustomEventsAnalytics(db *pgxpool.Pool) *CustomEventsAnalytics {
	return &CustomEventsAnalytics{db: db}
}

// GetCustomEventStats returns custom event statistics for a website
func (ce *CustomEventsAnalytics) GetCustomEventStats(ctx context.Context, websiteID string, days int) ([]models.CustomEventStat, error) {
	// First, get aggregated event counts by type
	query := `
		SELECT 
			event_type,
			COUNT(*) as count
		FROM events
		WHERE website_id = $1 
		AND timestamp >= NOW() - INTERVAL '1 day' * $2
		AND event_type != 'pageview'
		AND event_type != 'session_start'
		AND event_type != 'session_end'
		GROUP BY event_type
		ORDER BY count DESC
		LIMIT 50`

	rows, err := ce.db.Query(ctx, query, websiteID, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []models.CustomEventStat
	for rows.Next() {
		var event models.CustomEventStat
		err := rows.Scan(&event.EventType, &event.Count)
		if err != nil {
			continue
		}

		// Get sample properties for this event type
		sampleProps, err := ce.getSampleProperties(ctx, websiteID, event.EventType, days)
		if err != nil {
			// If we can't get sample properties, continue with empty ones
			event.CommonProperties = models.Properties{}
			event.SampleProperties = models.Properties{}
			event.SampleEvent = models.Properties{}
		} else {
			event.SampleProperties = sampleProps
			event.SampleEvent = sampleProps
			event.CommonProperties = ce.extractCommonProperties(sampleProps)
		}

		events = append(events, event)
	}

	return events, nil
}

// getSampleProperties gets a sample event with properties for a specific event type
func (ce *CustomEventsAnalytics) getSampleProperties(ctx context.Context, websiteID, eventType string, days int) (models.Properties, error) {
	query := `
		SELECT properties
		FROM events
		WHERE website_id = $1 
		AND event_type = $2
		AND timestamp >= NOW() - INTERVAL '1 day' * $3
		AND properties IS NOT NULL
		AND properties != '{}'
		ORDER BY timestamp DESC
		LIMIT 1`

	var propertiesJSON string
	err := ce.db.QueryRow(ctx, query, websiteID, eventType, days).Scan(&propertiesJSON)
	if err != nil {
		return models.Properties{}, err
	}

	// Parse the JSON properties
	var properties models.Properties
	if propertiesJSON != "" && propertiesJSON != "{}" {
		err = json.Unmarshal([]byte(propertiesJSON), &properties)
		if err != nil {
			return models.Properties{}, err
		}
	}

	return properties, nil
}

// extractCommonProperties extracts common property keys from sample properties
func (ce *CustomEventsAnalytics) extractCommonProperties(props models.Properties) models.Properties {
	if props == nil {
		return models.Properties{}
	}

	// For now, return the sample properties as common properties
	// In a more sophisticated implementation, you could analyze multiple events
	// and find properties that appear in most events of the same type
	return props
}
