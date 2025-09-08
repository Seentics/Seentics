-- Rollback migration for funnel analytics columns

-- Drop indexes
DROP INDEX IF EXISTS idx_funnel_events_analytics;
DROP INDEX IF EXISTS idx_funnel_events_step;
DROP INDEX IF EXISTS idx_funnel_events_funnel_visitor;
DROP INDEX IF EXISTS idx_funnel_events_started_at;
DROP INDEX IF EXISTS idx_funnel_events_last_activity;
DROP INDEX IF EXISTS idx_funnel_events_converted;

-- Drop columns
ALTER TABLE funnel_events DROP COLUMN IF EXISTS step_name;
ALTER TABLE funnel_events DROP COLUMN IF EXISTS completed_steps;
ALTER TABLE funnel_events DROP COLUMN IF EXISTS started_at;
ALTER TABLE funnel_events DROP COLUMN IF EXISTS last_activity;
ALTER TABLE funnel_events DROP COLUMN IF EXISTS converted;
