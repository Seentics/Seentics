package utils

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// TimescaleDBHelper provides utility functions for TimescaleDB operations
type TimescaleDBHelper struct {
	db *pgxpool.Pool
}

func NewTimescaleDBHelper(db *pgxpool.Pool) *TimescaleDBHelper {
	return &TimescaleDBHelper{db: db}
}

// GetHypertableStats returns statistics about hypertables
func (h *TimescaleDBHelper) GetHypertableStats(ctx context.Context) (map[string]interface{}, error) {
	query := `
		SELECT 
			hypertable_name,
			compression_enabled,
			num_chunks,
			COALESCE(SUM(c.total_size_bytes), 0) as total_size_bytes,
			COALESCE(SUM(c.compressed_size_bytes), 0) as compressed_size_bytes,
			CASE 
				WHEN COALESCE(SUM(c.total_size_bytes), 0) > 0 
				THEN ROUND((1 - COALESCE(SUM(c.compressed_size_bytes), 0)::float / SUM(c.total_size_bytes)::float) * 100, 2)
				ELSE 0 
			END as compression_ratio
		FROM timescaledb_information.hypertables h
		LEFT JOIN timescaledb_information.chunks c ON h.hypertable_name = c.hypertable_name
		WHERE h.hypertable_name = $1
		GROUP BY hypertable_name, num_chunks, compression_enabled`

	rows, err := h.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	stats := make(map[string]interface{})
	for rows.Next() {
		var tableName string
		var numChunks *int
		var totalSize, compressedSize *int64
		var compressionRatio *float64

		err := rows.Scan(&tableName, &numChunks, &totalSize, &compressedSize, &compressionRatio)
		if err != nil {
			return nil, err
		}

		stats[tableName] = map[string]interface{}{
			"num_chunks":        numChunks,
			"total_size_bytes":  totalSize,
			"compressed_size":   compressedSize,
			"compression_ratio": compressionRatio,
		}
	}

	return stats, rows.Err()
}

// GetChunkInfo returns information about table chunks
func (h *TimescaleDBHelper) GetChunkInfo(ctx context.Context, tableName string) ([]map[string]interface{}, error) {
	query := `
		SELECT 
			chunk_name,
			range_start,
			range_end,
			compressed,
			chunk_size
		FROM timescaledb_information.chunks
		WHERE hypertable_name = $1
		ORDER BY range_start DESC
		LIMIT 20`

	rows, err := h.db.Query(ctx, query, tableName)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var chunks []map[string]interface{}
	for rows.Next() {
		var chunkName string
		var rangeStart, rangeEnd *time.Time
		var compressed *bool
		var chunkSize *int64

		err := rows.Scan(&chunkName, &rangeStart, &rangeEnd, &compressed, &chunkSize)
		if err != nil {
			return nil, err
		}

		chunks = append(chunks, map[string]interface{}{
			"chunk_name":  chunkName,
			"range_start": rangeStart,
			"range_end":   rangeEnd,
			"compressed":  compressed,
			"chunk_size":  chunkSize,
		})
	}

	return chunks, rows.Err()
}

// OptimizeQueries runs TimescaleDB-specific query optimizations
func (h *TimescaleDBHelper) OptimizeQueries(ctx context.Context) error {
	// Update table statistics for better query planning
	optimizations := []string{
		"ANALYZE events",
		"ANALYZE funnel_events",
		"ANALYZE funnels",
	}

	for _, query := range optimizations {
		_, err := h.db.Exec(ctx, query)
		if err != nil {
			return fmt.Errorf("failed to run optimization: %s, error: %w", query, err)
		}
	}

	return nil
}

// GetTimescaleDBInfo returns general information about the TimescaleDB instance
func (h *TimescaleDBHelper) GetTimescaleDBInfo(ctx context.Context) (map[string]interface{}, error) {
	info := make(map[string]interface{})

	// Get TimescaleDB version
	var version string
	err := h.db.QueryRow(ctx, "SELECT extversion FROM pg_extension WHERE extname = 'timescaledb'").Scan(&version)
	if err == nil {
		info["version"] = version
	}

	// Get total number of hypertables
	var hypertableCount int
	err = h.db.QueryRow(ctx, "SELECT COUNT(*) FROM timescaledb_information.hypertables").Scan(&hypertableCount)
	if err == nil {
		info["hypertable_count"] = hypertableCount
	}

	// Get total number of chunks
	var chunkCount int
	err = h.db.QueryRow(ctx, "SELECT COUNT(*) FROM timescaledb_information.chunks").Scan(&chunkCount)
	if err == nil {
		info["chunk_count"] = chunkCount
	}

	// Get compression stats
	var compressedChunks int
	err = h.db.QueryRow(ctx, `
		SELECT COUNT(*) 
		FROM timescaledb_information.chunks 
		WHERE compressed = true`).Scan(&compressedChunks)
	if err == nil {
		info["compressed_chunks"] = compressedChunks
	}

	// Get database size
	var dbSize string
	err = h.db.QueryRow(ctx, "SELECT pg_size_pretty(pg_database_size(current_database()))").Scan(&dbSize)
	if err == nil {
		info["database_size"] = dbSize
	}

	return info, nil
}

// CreateCustomContinuousAggregate creates a custom continuous aggregate
func (h *TimescaleDBHelper) CreateCustomContinuousAggregate(ctx context.Context, name, query string) error {
	createSQL := fmt.Sprintf(`
		CREATE MATERIALIZED VIEW IF NOT EXISTS %s
		WITH (timescaledb.continuous) AS
		%s`, name, query)

	_, err := h.db.Exec(ctx, createSQL)
	if err != nil {
		return fmt.Errorf("failed to create continuous aggregate %s: %w", name, err)
	}

	return nil
}
