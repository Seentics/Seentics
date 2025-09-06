package models

import "time"

// SessionAnalytics represents session-based analytics data
type SessionAnalytics struct {
	TotalSessions      int     `json:"total_sessions" db:"total_sessions"`
	AvgPagesPerSession int     `json:"avg_pages_per_session" db:"avg_pages_per_session"`
	AvgSessionDuration float64 `json:"avg_session_duration" db:"avg_session_duration"`
	SinglePageSessions int     `json:"single_page_sessions" db:"single_page_sessions"`
	AvgUniquePages     int     `json:"avg_unique_pages" db:"avg_unique_pages"`
	ExitIntentSessions int     `json:"exit_intent_sessions" db:"exit_intent_sessions"`
	AvgScrollDepth     int     `json:"avg_scroll_depth" db:"avg_scroll_depth"`
}

// ConversionStep represents a step in the conversion funnel
type ConversionStep struct {
	StepName       string  `json:"step_name" db:"step_name"`
	StepOrder      int     `json:"step_order" db:"step_order"`
	Visitors       int     `json:"visitors" db:"visitors"`
	ConversionRate float64 `json:"conversion_rate" db:"conversion_rate"`
}

// TimeBucketStat represents time-bucketed statistics
type TimeBucketStat struct {
	TimePeriod     time.Time `json:"time_period" db:"time_period"`
	PageViews      int       `json:"page_views" db:"page_views"`
	UniqueVisitors int       `json:"unique_visitors" db:"unique_visitors"`
	Sessions       int       `json:"sessions" db:"sessions"`
	BounceRate     float64   `json:"bounce_rate" db:"bounce_rate"`
}

// AggregatedMetric represents pre-computed metrics from continuous aggregates
type AggregatedMetric struct {
	WebsiteID      string    `json:"website_id" db:"website_id"`
	TimePeriod     time.Time `json:"time_period" db:"time_period"`
	PageViews      int       `json:"page_views" db:"page_views"`
	UniqueVisitors int       `json:"unique_visitors" db:"unique_visitors"`
	Sessions       int       `json:"sessions" db:"sessions"`
	AvgTimeOnPage  float64   `json:"avg_time_on_page" db:"avg_time_on_page"`
	DirectVisits   int       `json:"direct_visits" db:"direct_visits"`
	UTMVisits      int       `json:"utm_visits" db:"utm_visits"`
	CustomEvents   int       `json:"custom_events" db:"custom_events"`
	NewVisitors    int       `json:"new_visitors" db:"new_visitors"`
	BotVisits      int       `json:"bot_visits" db:"bot_visits"`
}

// PerformanceMetric represents website performance analytics
type PerformanceMetric struct {
	Page            string   `json:"page" db:"page"`
	AvgLoadTime     *float64 `json:"avg_load_time" db:"avg_load_time"`
	AvgScrollDepth  *float64 `json:"avg_scroll_depth" db:"avg_scroll_depth"`
	EngagementScore *float64 `json:"engagement_score" db:"engagement_score"`
	BounceRate      *float64 `json:"bounce_rate" db:"bounce_rate"`
	ExitRate        *float64 `json:"exit_rate" db:"exit_rate"`
	Views           int      `json:"views" db:"views"`
	UniqueViews     int      `json:"unique_views" db:"unique_views"`
}

// RealtimeMetric represents real-time analytics data
type RealtimeMetric struct {
	WebsiteID          string    `json:"website_id" db:"website_id"`
	Timestamp          time.Time `json:"timestamp" db:"timestamp"`
	ActiveUsers        int       `json:"active_users" db:"active_users"`
	PageViewsPerMinute int       `json:"page_views_per_minute" db:"page_views_per_minute"`
	CurrentSessions    int       `json:"current_sessions" db:"current_sessions"`
	TopPageLastHour    string    `json:"top_page_last_hour" db:"top_page_last_hour"`
	AvgTimeOnPageNow   float64   `json:"avg_time_on_page_now" db:"avg_time_on_page_now"`
}

// GeographicStat represents geographic analytics with enhanced metrics
type GeographicStat struct {
	Country        string   `json:"country" db:"country"`
	City           string   `json:"city" db:"city"`
	Views          int      `json:"views" db:"views"`
	UniqueVisitors int      `json:"unique_visitors" db:"unique_visitors"`
	Sessions       int      `json:"sessions" db:"sessions"`
	BounceRate     *float64 `json:"bounce_rate" db:"bounce_rate"`
	AvgSessionTime *float64 `json:"avg_session_time" db:"avg_session_time"`
	ConversionRate *float64 `json:"conversion_rate" db:"conversion_rate"`
	RevenuePerUser *float64 `json:"revenue_per_user" db:"revenue_per_user"`
}

// TechnologyStat represents technology-based analytics (browser, OS, device)
type TechnologyStat struct {
	Technology     string   `json:"technology" db:"technology"`
	Type           string   `json:"type" db:"type"` // 'browser', 'os', 'device'
	Views          int      `json:"views" db:"views"`
	UniqueVisitors int      `json:"unique_visitors" db:"unique_visitors"`
	Sessions       int      `json:"sessions" db:"sessions"`
	BounceRate     *float64 `json:"bounce_rate" db:"bounce_rate"`
	AvgSessionTime *float64 `json:"avg_session_time" db:"avg_session_time"`
	ConversionRate *float64 `json:"conversion_rate" db:"conversion_rate"`
	MarketShare    *float64 `json:"market_share" db:"market_share"`
}

// UTMAnalytics represents UTM campaign performance analytics
type UTMAnalytics struct {
	UTMSource       string   `json:"utm_source" db:"utm_source"`
	UTMMedium       string   `json:"utm_medium" db:"utm_medium"`
	UTMCampaign     string   `json:"utm_campaign" db:"utm_campaign"`
	UTMTerm         string   `json:"utm_term" db:"utm_term"`
	UTMContent      string   `json:"utm_content" db:"utm_content"`
	Views           int      `json:"views" db:"views"`
	UniqueVisitors  int      `json:"unique_visitors" db:"unique_visitors"`
	Sessions        int      `json:"sessions" db:"sessions"`
	Conversions     int      `json:"conversions" db:"conversions"`
	ConversionRate  *float64 `json:"conversion_rate" db:"conversion_rate"`
	Revenue         *float64 `json:"revenue" db:"revenue"`
	CostPerClick    *float64 `json:"cost_per_click" db:"cost_per_click"`
	ReturnOnAdSpend *float64 `json:"return_on_ad_spend" db:"return_on_ad_spend"`
}

// EventTypeStat represents custom event analytics
type EventTypeStat struct {
	EventType      string     `json:"event_type" db:"event_type"`
	Count          int        `json:"count" db:"count"`
	UniqueUsers    int        `json:"unique_users" db:"unique_users"`
	Sessions       int        `json:"sessions" db:"sessions"`
	AvgValue       *float64   `json:"avg_value" db:"avg_value"`
	TotalValue     *float64   `json:"total_value" db:"total_value"`
	Properties     Properties `json:"properties" db:"properties"`
	FirstSeen      *time.Time `json:"first_seen" db:"first_seen"`
	LastSeen       *time.Time `json:"last_seen" db:"last_seen"`
	TrendDirection string     `json:"trend_direction" db:"trend_direction"` // 'up', 'down', 'stable'
}
