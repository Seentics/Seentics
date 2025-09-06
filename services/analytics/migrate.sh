#!/bin/bash

# Database Migration Runner for Analytics Service
# This script runs database migrations manually

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Running Analytics Service Database Migrations${NC}"

# Check if we're in the right directory
if [ ! -f "migrations/migrate.go" ]; then
    echo -e "${RED}❌ Error: Please run this script from the analytics service directory${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    exit 1
fi

# Check if TimescaleDB container is running
if ! docker-compose ps timescaledb | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  TimescaleDB container is not running. Starting services...${NC}"
    docker-compose up -d timescaledb
    echo -e "${YELLOW}⏳ Waiting for TimescaleDB to be ready...${NC}"
    sleep 10
fi

echo -e "${GREEN}✅ TimescaleDB is running${NC}"

# Run migrations
echo -e "${YELLOW}🔄 Running migrations...${NC}"

# Copy migration files to container
docker cp migrations/001_initial_schema.sql timescaledb:/tmp/001_initial_schema.sql
docker cp migrations/002_funnels_schema.sql timescaledb:/tmp/002_funnels_schema.sql
docker cp migrations/003_materialized_views.sql timescaledb:/tmp/003_materialized_views.sql

# Run migrations in order
echo -e "${YELLOW}📝 Running migration 001_initial_schema.sql...${NC}"
docker-compose exec timescaledb psql -U user -d analytics -f /tmp/001_initial_schema.sql

echo -e "${YELLOW}📝 Running migration 002_funnels_schema.sql...${NC}"
docker-compose exec timescaledb psql -U user -d analytics -f /tmp/002_funnels_schema.sql

echo -e "${YELLOW}📝 Running migration 003_materialized_views.sql...${NC}"
docker-compose exec timescaledb psql -U user -d analytics -f /tmp/003_materialized_views.sql

echo -e "${GREEN}✅ All migrations completed successfully!${NC}"

# Verify tables were created
echo -e "${YELLOW}🔍 Verifying database schema...${NC}"
docker-compose exec timescaledb psql -U user -d analytics -c "\dt"

echo -e "${GREEN}🎉 Database migrations completed successfully!${NC}"
