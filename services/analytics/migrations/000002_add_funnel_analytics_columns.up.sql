-- Add missing columns for funnel analytics
-- These columns are required by the analytics queries but were missing from the initial schema
-- Using NULL defaults to avoid TimescaleDB hypertable compression issues

-- Add converted column to track if visitor completed the funnel
ALTER TABLE funnel_events ADD COLUMN IF NOT EXISTS converted BOOLEAN;

-- Add last_activity column to track when visitor last interacted  
ALTER TABLE funnel_events ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ;

-- Add started_at column to track when visitor started the funnel step
ALTER TABLE funnel_events ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

-- Add completed_steps column to track which steps visitor has completed
ALTER TABLE funnel_events ADD COLUMN IF NOT EXISTS completed_steps JSONB;

-- Add step_name column to track the name of the current step
ALTER TABLE funnel_events ADD COLUMN IF NOT EXISTS step_name VARCHAR(255);

-- Update existing records to have proper values
-- Set converted to false for existing records (they haven't completed yet)
UPDATE funnel_events 
SET converted = FALSE
WHERE converted IS NULL;

-- Set timestamps for existing records
UPDATE funnel_events 
SET 
    last_activity = created_at,
    started_at = created_at
WHERE last_activity IS NULL OR started_at IS NULL;

-- Set default values for completed_steps (empty array) and step_name
UPDATE funnel_events 
SET 
    completed_steps = '[]'::jsonb,
    step_name = 'Step ' || current_step
WHERE completed_steps IS NULL OR step_name IS NULL;

-- Now set defaults for future records
ALTER TABLE funnel_events ALTER COLUMN converted SET DEFAULT FALSE;
ALTER TABLE funnel_events ALTER COLUMN last_activity SET DEFAULT NOW();
ALTER TABLE funnel_events ALTER COLUMN started_at SET DEFAULT NOW();

-- Add NOT NULL constraints after setting values
ALTER TABLE funnel_events ALTER COLUMN converted SET NOT NULL;

-- Add indexes for better performance on analytics queries
CREATE INDEX IF NOT EXISTS idx_funnel_events_converted ON funnel_events(converted);
CREATE INDEX IF NOT EXISTS idx_funnel_events_last_activity ON funnel_events(last_activity) WHERE last_activity IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_funnel_events_started_at ON funnel_events(started_at) WHERE started_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_funnel_events_funnel_visitor ON funnel_events(funnel_id, visitor_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_step ON funnel_events(funnel_id, current_step);

-- Add composite index for analytics queries
CREATE INDEX IF NOT EXISTS idx_funnel_events_analytics 
ON funnel_events(funnel_id, created_at DESC, converted, current_step);
