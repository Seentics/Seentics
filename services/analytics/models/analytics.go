package models

import "time"

type DashboardMetrics struct {
	PageViews       int     `json:"page_views" db:"page_views"`
	TotalVisitors   int     `json:"total_visitors" db:"total_visitors"`
	UniqueVisitors  int     `json:"unique_visitors" db:"unique_visitors"`
	Sessions        int     `json:"sessions" db:"sessions"`
	BounceRate      float64 `json:"bounce_rate" db:"bounce_rate"`
	AvgSessionTime  float64 `json:"avg_session_time" db:"avg_session_time"`
	PagesPerSession float64 `json:"pages_per_session" db:"pages_per_session"`
}

type ComparisonMetrics struct {
	TotalVisitorChange *float64 `json:"total_visitor_change,omitempty" db:"total_visitor_change"`
	VisitorChange      *float64 `json:"visitor_change,omitempty" db:"visitor_change"`
	PageviewChange     *float64 `json:"pageview_change,omitempty" db:"pageview_change"`
	SessionChange      *float64 `json:"session_change,omitempty" db:"session_change"`
	BounceChange       *float64 `json:"bounce_change,omitempty" db:"bounce_change"`
	DurationChange     *float64 `json:"duration_change,omitempty" db:"duration_change"`
}

type DashboardData struct {
	WebsiteID string `json:"website_id"`
	DateRange string `json:"date_range"`
	// Core 6 stats for SummaryCards
	TotalVisitors   int     `json:"total_visitors"`
	UniqueVisitors  int     `json:"unique_visitors"`
	LiveVisitors    int     `json:"live_visitors"`
	PageViews       int     `json:"page_views"`
	SessionDuration float64 `json:"session_duration"`
	BounceRate      float64 `json:"bounce_rate"`
	// Comparison metrics for growth indicators
	Comparison *ComparisonMetrics `json:"comparison,omitempty"`
}

type PageStat struct {
	Page       string   `json:"page" db:"page"`
	Views      int      `json:"views" db:"views"`
	Unique     int      `json:"unique" db:"unique"`
	BounceRate *float64 `json:"bounce_rate,omitempty" db:"bounce_rate"`
	AvgTime    *int     `json:"avg_time,omitempty" db:"avg_time"`
	ExitRate   *float64 `json:"exit_rate,omitempty" db:"exit_rate"`
	EntryRate  *float64 `json:"entry_rate,omitempty" db:"entry_rate"`
}

type ReferrerStat struct {
	Referrer   string   `json:"referrer" db:"referrer"`
	Views      int      `json:"views" db:"views"`
	Unique     int      `json:"unique" db:"unique"`
	BounceRate *float64 `json:"bounce_rate,omitempty" db:"bounce_rate"`
}

type SourceStat struct {
	Source         string  `json:"source" db:"source"`
	Views          int     `json:"views" db:"views"`
	UniqueVisitors int     `json:"unique_visitors" db:"unique_visitors"`
	BounceRate     float64 `json:"bounce_rate" db:"bounce_rate"`
}

type CountryStat struct {
	Country    string   `json:"country" db:"country"`
	Views      int      `json:"views" db:"views"`
	Unique     int      `json:"unique" db:"unique"`
	BounceRate *float64 `json:"bounce_rate,omitempty" db:"bounce_rate"`
}

type BrowserStat struct {
	Browser    string   `json:"browser" db:"browser"`
	Views      int      `json:"views" db:"views"`
	Unique     int      `json:"unique" db:"unique"`
	BounceRate *float64 `json:"bounce_rate,omitempty" db:"bounce_rate"`
}

type DeviceStat struct {
	Device     string   `json:"device" db:"device"`
	Views      int      `json:"views" db:"views"`
	Unique     int      `json:"unique" db:"unique"`
	BounceRate *float64 `json:"bounce_rate,omitempty" db:"bounce_rate"`
}

type OSStat struct {
	OS         string   `json:"os" db:"os"`
	Views      int      `json:"views" db:"views"`
	Unique     int      `json:"unique" db:"unique"`
	BounceRate *float64 `json:"bounce_rate,omitempty" db:"bounce_rate"`
}

type DailyStat struct {
	Date   time.Time `json:"date" db:"date"`
	Views  int       `json:"views" db:"views"`
	Unique int       `json:"unique" db:"unique"`
}

type HourlyStat struct {
	Hour      int       `json:"hour" db:"hour"`
	Timestamp time.Time `json:"timestamp" db:"timestamp"`
	Views     int       `json:"views" db:"views"`
	Unique    int       `json:"unique" db:"unique"`
	HourLabel string    `json:"hour_label" db:"hour_label"`
}

type CustomEventStat struct {
	EventType        string     `json:"event_type" db:"event_type"`
	Count            int        `json:"count" db:"count"`
	Description      *string    `json:"description,omitempty" db:"description"`
	CommonProperties Properties `json:"common_properties,omitempty" db:"common_properties"`
	SampleProperties Properties `json:"sample_properties,omitempty" db:"sample_properties"`
	SampleEvent      Properties `json:"sample_event,omitempty" db:"sample_event"`
}

type TrafficSummary struct {
	TotalPageViews     int     `json:"total_page_views" db:"total_page_views"`
	TotalVisitors      int     `json:"total_visitors" db:"total_visitors"`
	UniqueVisitors     int     `json:"unique_visitors" db:"unique_visitors"`
	TotalSessions      int     `json:"total_sessions" db:"total_sessions"`
	BounceRate         float64 `json:"bounce_rate" db:"bounce_rate"`
	AvgSessionTime     float64 `json:"avg_session_time" db:"avg_session_time"`
	PagesPerSession    float64 `json:"pages_per_session" db:"pages_per_session"`
	GrowthRate         float64 `json:"growth_rate" db:"growth_rate"`
	VisitorsGrowthRate float64 `json:"visitors_growth_rate" db:"visitors_growth_rate"`
	SessionsGrowthRate float64 `json:"sessions_growth_rate" db:"sessions_growth_rate"`
	NewVisitors        int     `json:"new_visitors" db:"new_visitors"`
	ReturningVisitors  int     `json:"returning_visitors" db:"returning_visitors"`
	EngagementScore    float64 `json:"engagement_score" db:"engagement_score"`
	RetentionRate      float64 `json:"retention_rate" db:"retention_rate"`
}
