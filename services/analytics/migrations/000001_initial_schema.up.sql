-- Initial schema for analytics service aligned with Go models
-- This schema matches the Event struct exactly

-- Create events table matching Event model
CREATE TABLE events (
    id UUID DEFAULT gen_random_uuid(),
    website_id VARCHAR(24) NOT NULL,
    visitor_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    page TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    country VARCHAR(2),
    city VARCHAR(100),
    browser VARCHAR(100),
    device VARCHAR(50),
    os VARCHAR(100),
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_term VARCHAR(255),
    utm_content VARCHAR(255),
    time_on_page INTEGER,
    properties JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, timestamp)
);

-- Create funnel_events table for funnel tracking
CREATE TABLE funnel_events (
    id UUID DEFAULT gen_random_uuid(),
    funnel_id UUID NOT NULL,
    website_id VARCHAR(24) NOT NULL,
    visitor_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255),
    current_step INTEGER NOT NULL,
    step_name VARCHAR(255),
    completed BOOLEAN DEFAULT FALSE,
    properties JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
);

-- Create funnels table for funnel definitions
CREATE TABLE funnels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id VARCHAR(24) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    steps JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    user_id VARCHAR(24),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create custom_events_aggregated table for custom events analytics
CREATE TABLE custom_events_aggregated (
    id UUID DEFAULT gen_random_uuid(),
    website_id VARCHAR(24) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    event_signature VARCHAR(64) NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    sample_properties JSONB,
    first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, last_seen)
);

-- Create privacy_requests table for GDPR compliance
CREATE TABLE privacy_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id VARCHAR(24) NOT NULL,
    visitor_id VARCHAR(255) NOT NULL,
    request_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    data JSONB
);

-- Convert tables to hypertables (TimescaleDB)
SELECT create_hypertable('events', 'timestamp', if_not_exists => TRUE);
SELECT create_hypertable('funnel_events', 'created_at', if_not_exists => TRUE);
SELECT create_hypertable('custom_events_aggregated', 'last_seen', if_not_exists => TRUE);

-- Create indexes for better query performance
CREATE INDEX idx_events_website_timestamp ON events(website_id, timestamp DESC);
CREATE INDEX idx_events_visitor_id ON events(visitor_id);
CREATE INDEX idx_events_session_id ON events(session_id);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_page ON events(page) WHERE page IS NOT NULL;
CREATE INDEX idx_events_utm_source ON events(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX idx_events_utm_campaign ON events(utm_campaign) WHERE utm_campaign IS NOT NULL;

CREATE INDEX idx_funnel_events_funnel_id ON funnel_events(funnel_id, created_at DESC);
CREATE INDEX idx_funnel_events_website_id ON funnel_events(website_id);
CREATE INDEX idx_funnel_events_visitor_id ON funnel_events(visitor_id);

CREATE INDEX idx_funnels_website_id ON funnels(website_id);
CREATE INDEX idx_custom_events_aggregated_website_signature ON custom_events_aggregated (website_id, event_signature, last_seen);
CREATE INDEX idx_custom_events_last_seen ON custom_events_aggregated(last_seen);
CREATE INDEX idx_privacy_requests_website_id ON privacy_requests(website_id);

-- Enable compression on hypertables
ALTER TABLE events SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'website_id',
    timescaledb.compress_orderby = 'timestamp DESC, id'
);

ALTER TABLE funnel_events SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'website_id',
    timescaledb.compress_orderby = 'created_at DESC, id'
);

ALTER TABLE custom_events_aggregated SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'website_id',
    timescaledb.compress_orderby = 'last_seen DESC, id'
);

-- Add compression policies (compress data older than 7 days)
SELECT add_compression_policy('events', INTERVAL '7 days', if_not_exists => TRUE);
SELECT add_compression_policy('funnel_events', INTERVAL '7 days', if_not_exists => TRUE);
SELECT add_compression_policy('custom_events_aggregated', INTERVAL '7 days', if_not_exists => TRUE);

-- Add retention policies (keep data for 2 years)
SELECT add_retention_policy('events', INTERVAL '2 years', if_not_exists => TRUE);
SELECT add_retention_policy('funnel_events', INTERVAL '2 years', if_not_exists => TRUE);
SELECT add_retention_policy('custom_events_aggregated', INTERVAL '1 year', if_not_exists => TRUE);
