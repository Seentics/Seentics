# Database Migrations

This directory contains database migration files for the Analytics Service.

## Migration Files

- `001_initial_schema.sql` - Creates the main `events` table and TimescaleDB hypertable
- `002_funnels_schema.sql` - Creates funnel-related tables (`funnels`, `funnel_events`)
- `003_materialized_views.sql` - Creates continuous aggregates for performance

## Running Migrations

### Automatic (Recommended)
Migrations run automatically when the analytics service starts up. The service will:
1. Connect to the database
2. Run any pending migrations
3. Start the application

### Manual
You can run migrations manually using the provided script:

```bash
cd services/analytics
./migrate.sh
```

Or run individual migrations:

```bash
# Copy migration to container
docker cp migrations/001_initial_schema.sql timescaledb:/tmp/001_initial_schema.sql

# Run migration
docker-compose exec timescaledb psql -U user -d analytics -f /tmp/001_initial_schema.sql
```

## Migration Tracking

The system tracks applied migrations in the `schema_migrations` table:

```sql
SELECT * FROM schema_migrations ORDER BY version;
```

## Creating New Migrations

1. Create a new SQL file with the format: `XXX_description.sql`
   - `XXX` should be the next sequential number (e.g., `004`, `005`)
   - Use descriptive names for the migration

2. The migration file should contain:
   - SQL DDL statements (CREATE TABLE, ALTER TABLE, etc.)
   - Comments explaining what the migration does
   - Proper error handling with `IF NOT EXISTS` where appropriate

3. Test the migration:
   - Run it manually first
   - Verify it works with existing data
   - Test rollback scenarios if needed

## Best Practices

- **Always use `IF NOT EXISTS`** for CREATE statements
- **Use transactions** for complex migrations
- **Test migrations** on a copy of production data
- **Keep migrations small** and focused on a single change
- **Never modify existing migration files** once they've been applied
- **Use descriptive names** that explain what the migration does

## Troubleshooting

### Migration Fails
If a migration fails:
1. Check the error message in the logs
2. Fix the SQL and create a new migration file
3. Don't modify existing migration files

### Database Connection Issues
- Ensure TimescaleDB container is running: `docker-compose ps timescaledb`
- Check database credentials in `.env` file
- Verify network connectivity between services

### Schema Conflicts
- Check if tables already exist: `docker-compose exec timescaledb psql -U user -d analytics -c "\dt"`
- Use `IF NOT EXISTS` clauses to prevent conflicts
- Consider dropping and recreating tables in development
