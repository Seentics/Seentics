package database

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// TimescaleConfig holds TimescaleDB-specific configuration
type TimescaleConfig struct {
	ChunkTimeInterval string
	CompressionAfter  string
	RetentionPeriod   string
}

// DefaultTimescaleConfig returns sensible defaults for TimescaleDB
func DefaultTimescaleConfig() *TimescaleConfig {
	return &TimescaleConfig{
		ChunkTimeInterval: "1 day",
		CompressionAfter:  "7 days",
		RetentionPeriod:   "90 days",
	}
}

// ConnectTimescale creates a connection pool optimized for TimescaleDB
func ConnectTimescale(databaseURL string) (*pgxpool.Pool, error) {
	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse database URL: %w", err)
	}

	// TimescaleDB-optimized connection pool settings
	config.MaxConns = 50                   // Higher for analytics workloads
	config.MinConns = 10                   // Keep more connections warm
	config.MaxConnLifetime = 2 * time.Hour // Longer for stable connections
	config.MaxConnIdleTime = 15 * time.Minute
	config.HealthCheckPeriod = 1 * time.Minute

	// TimescaleDB-specific connection parameters
	config.ConnConfig.Config.RuntimeParams["timezone"] = "UTC"
	config.ConnConfig.Config.RuntimeParams["application_name"] = "analytics-app"

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	// Test connection and verify TimescaleDB extension
	if err := verifyTimescaleDB(ctx, pool); err != nil {
		pool.Close()
		return nil, err
	}

	return pool, nil
}

// verifyTimescaleDB checks if TimescaleDB extension is available and configured
func verifyTimescaleDB(ctx context.Context, pool *pgxpool.Pool) error {
	// Test basic connection
	if err := pool.Ping(ctx); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	// Check if TimescaleDB extension is installed
	var hasTimescale bool
	query := "SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'timescaledb')"
	err := pool.QueryRow(ctx, query).Scan(&hasTimescale)
	if err != nil {
		return fmt.Errorf("failed to check TimescaleDB extension: %w", err)
	}

	if !hasTimescale {
		return fmt.Errorf("TimescaleDB extension is not installed")
	}

	// Check TimescaleDB version
	var version string
	err = pool.QueryRow(ctx, "SELECT extversion FROM pg_extension WHERE extname = 'timescaledb'").Scan(&version)
	if err != nil {
		return fmt.Errorf("failed to get TimescaleDB version: %w", err)
	}

	fmt.Printf("TimescaleDB version: %s\n", version)
	return nil
}

// CreateHypertable creates a hypertable for time-series data
func CreateHypertable(ctx context.Context, pool *pgxpool.Pool, tableName, timeColumn string) error {
	query := fmt.Sprintf("SELECT create_hypertable('%s', '%s', if_not_exists => TRUE)", tableName, timeColumn)
	_, err := pool.Exec(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to create hypertable %s: %w", tableName, err)
	}
	return nil
}

// SetupRetentionPolicy adds a data retention policy to a hypertable
func SetupRetentionPolicy(ctx context.Context, pool *pgxpool.Pool, tableName string, retentionPeriod string) error {
	query := fmt.Sprintf("SELECT add_retention_policy('%s', INTERVAL '%s', if_not_exists => TRUE)", tableName, retentionPeriod)
	_, err := pool.Exec(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to set retention policy for %s: %w", tableName, err)
	}
	return nil
}

// SetupCompressionPolicy adds a compression policy to a hypertable
func SetupCompressionPolicy(ctx context.Context, pool *pgxpool.Pool, tableName string, compressAfter string) error {
	// First enable compression on the table
	compressQuery := fmt.Sprintf(`
		ALTER TABLE %s SET (
			timescaledb.compress,
			timescaledb.compress_orderby = 'timestamp DESC',
			timescaledb.compress_segmentby = 'website_id'
		)`, tableName)

	_, err := pool.Exec(ctx, compressQuery)
	if err != nil {
		return fmt.Errorf("failed to enable compression for %s: %w", tableName, err)
	}

	// Add compression policy
	policyQuery := fmt.Sprintf("SELECT add_compression_policy('%s', INTERVAL '%s', if_not_exists => TRUE)", tableName, compressAfter)
	_, err = pool.Exec(ctx, policyQuery)
	if err != nil {
		return fmt.Errorf("failed to set compression policy for %s: %w", tableName, err)
	}

	return nil
}
