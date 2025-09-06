package migrations

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog"
)

// Migration represents a database migration
type Migration struct {
	Version   int
	Name      string
	SQL       string
	AppliedAt *time.Time
}

// Migrator handles database migrations
type Migrator struct {
	db     *pgxpool.Pool
	logger zerolog.Logger
}

// NewMigrator creates a new migrator instance
func NewMigrator(db *pgxpool.Pool, logger zerolog.Logger) *Migrator {
	return &Migrator{
		db:     db,
		logger: logger,
	}
}

// RunMigrations executes all pending migrations
func (m *Migrator) RunMigrations(ctx context.Context) error {
	m.logger.Info().Msg("Starting database migrations")

	// Create migrations table if it doesn't exist
	if err := m.createMigrationsTable(ctx); err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}

	// Get list of migration files
	migrations, err := m.getMigrationFiles()
	if err != nil {
		return fmt.Errorf("failed to get migration files: %w", err)
	}

	// Get applied migrations
	appliedMigrations, err := m.getAppliedMigrations(ctx)
	if err != nil {
		return fmt.Errorf("failed to get applied migrations: %w", err)
	}

	// Find pending migrations
	pendingMigrations := m.findPendingMigrations(migrations, appliedMigrations)

	if len(pendingMigrations) == 0 {
		m.logger.Info().Msg("No pending migrations")
		return nil
	}

	m.logger.Info().Int("count", len(pendingMigrations)).Msg("Found pending migrations")

	// Apply pending migrations
	for _, migration := range pendingMigrations {
		if err := m.applyMigration(ctx, migration); err != nil {
			return fmt.Errorf("failed to apply migration %d: %w", migration.Version, err)
		}
	}

	m.logger.Info().Int("count", len(pendingMigrations)).Msg("Successfully applied migrations")
	return nil
}

// createMigrationsTable creates the migrations tracking table
func (m *Migrator) createMigrationsTable(ctx context.Context) error {
	query := `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version INTEGER PRIMARY KEY,
			name TEXT NOT NULL,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	`

	_, err := m.db.Exec(ctx, query)
	return err
}

// getMigrationFiles reads migration files from the filesystem
func (m *Migrator) getMigrationFiles() ([]Migration, error) {
	var migrations []Migration

	// Read migration files from the migrations directory
	files, err := filepath.Glob("migrations/*.sql")
	if err != nil {
		return nil, err
	}

	for _, file := range files {
		filename := filepath.Base(file)

		// Parse version from filename (e.g., "001_initial_schema.sql" -> 1)
		parts := strings.Split(filename, "_")
		if len(parts) < 2 {
			continue
		}

		version, err := strconv.Atoi(parts[0])
		if err != nil {
			continue
		}

		// Read SQL content
		content, err := os.ReadFile(file)
		if err != nil {
			return nil, fmt.Errorf("failed to read migration file %s: %w", file, err)
		}

		migration := Migration{
			Version: version,
			Name:    filename,
			SQL:     string(content),
		}

		migrations = append(migrations, migration)
	}

	// Sort by version
	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Version < migrations[j].Version
	})

	return migrations, nil
}

// getAppliedMigrations gets the list of already applied migrations
func (m *Migrator) getAppliedMigrations(ctx context.Context) (map[int]Migration, error) {
	query := `SELECT version, name, applied_at FROM schema_migrations ORDER BY version`

	rows, err := m.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	applied := make(map[int]Migration)
	for rows.Next() {
		var migration Migration
		err := rows.Scan(&migration.Version, &migration.Name, &migration.AppliedAt)
		if err != nil {
			return nil, err
		}
		applied[migration.Version] = migration
	}

	return applied, rows.Err()
}

// findPendingMigrations finds migrations that haven't been applied yet
func (m *Migrator) findPendingMigrations(migrations []Migration, applied map[int]Migration) []Migration {
	var pending []Migration

	for _, migration := range migrations {
		if _, exists := applied[migration.Version]; !exists {
			pending = append(pending, migration)
		}
	}

	return pending
}

// applyMigration applies a single migration
func (m *Migrator) applyMigration(ctx context.Context, migration Migration) error {
	m.logger.Info().
		Int("version", migration.Version).
		Str("name", migration.Name).
		Msg("Applying migration")

	// Check if this migration contains materialized views (continuous aggregates)
	// These cannot run inside transactions
	hasMaterializedViews := strings.Contains(strings.ToLower(migration.SQL), "materialized view") ||
		strings.Contains(strings.ToLower(migration.SQL), "continuous") ||
		strings.Contains(strings.ToLower(migration.SQL), "timescaledb.continuous")

	if hasMaterializedViews {
		// Execute migration SQL without transaction
		_, err := m.db.Exec(ctx, migration.SQL)
		if err != nil {
			return fmt.Errorf("failed to execute migration SQL: %w", err)
		}

		// Record migration as applied (in a separate transaction)
		recordQuery := `
			INSERT INTO schema_migrations (version, name, applied_at) 
			VALUES ($1, $2, NOW())
		`
		_, err = m.db.Exec(ctx, recordQuery, migration.Version, migration.Name)
		if err != nil {
			return fmt.Errorf("failed to record migration: %w", err)
		}
	} else {
		// Start transaction for regular migrations
		tx, err := m.db.Begin(ctx)
		if err != nil {
			return err
		}
		defer tx.Rollback(ctx)

		// Execute migration SQL
		_, err = tx.Exec(ctx, migration.SQL)
		if err != nil {
			return fmt.Errorf("failed to execute migration SQL: %w", err)
		}

		// Record migration as applied
		recordQuery := `
			INSERT INTO schema_migrations (version, name, applied_at) 
			VALUES ($1, $2, NOW())
		`
		_, err = tx.Exec(ctx, recordQuery, migration.Version, migration.Name)
		if err != nil {
			return fmt.Errorf("failed to record migration: %w", err)
		}

		// Commit transaction
		if err = tx.Commit(ctx); err != nil {
			return err
		}
	}

	m.logger.Info().
		Int("version", migration.Version).
		Str("name", migration.Name).
		Msg("Migration applied successfully")

	return nil
}
