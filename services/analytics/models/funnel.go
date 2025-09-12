package models

import (
	"time"

	"github.com/google/uuid"
)

type Funnel struct {
	ID          uuid.UUID   `json:"id" db:"id"`
	Name        string      `json:"name" db:"name"`
	Description *string     `json:"description,omitempty" db:"description"`
	WebsiteID   string      `json:"website_id" db:"website_id"`
	UserID      *string     `json:"user_id,omitempty" db:"user_id"`
	Steps       FunnelSteps `json:"steps" db:"steps"`
	IsActive    bool        `json:"is_active" db:"is_active"`
	CreatedAt   time.Time   `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at" db:"updated_at"`
}

type FunnelStep struct {
	ID        string          `json:"id"`
	Name      string          `json:"name"`
	Type      string          `json:"type"` // page, event, custom
	Condition FunnelCondition `json:"condition"`
	Order     int             `json:"order"`
}

type FunnelCondition struct {
	Page   *string `json:"page,omitempty"`
	Event  *string `json:"event,omitempty"`
	Custom *string `json:"custom,omitempty"`
}

type FunnelSteps []FunnelStep

type FunnelEvent struct {
	ID             uuid.UUID  `json:"id" db:"id"`
	FunnelID       uuid.UUID  `json:"funnel_id" db:"funnel_id"`
	WebsiteID      string     `json:"website_id" db:"website_id"`
	VisitorID      string     `json:"visitor_id" db:"visitor_id"`
	SessionID      string     `json:"session_id" db:"session_id"`
	CurrentStep    int        `json:"current_step" db:"current_step"`
	CompletedSteps []int      `json:"completed_steps" db:"completed_steps"`
	StartedAt      *time.Time `json:"started_at,omitempty" db:"started_at"`
	LastActivity   *time.Time `json:"last_activity,omitempty" db:"last_activity"`
	Converted      bool       `json:"converted" db:"converted"`
	Properties     Properties `json:"properties,omitempty" db:"properties"`
	CreatedAt      time.Time  `json:"created_at" db:"created_at"`
}

type FunnelAnalytics struct {
	FunnelID         uuid.UUID `json:"funnel_id" db:"funnel_id"`
	WebsiteID        string    `json:"website_id" db:"website_id"`
	Date             string    `json:"date" db:"date"`
	TotalStarts      int       `json:"total_starts" db:"total_starts"`
	TotalConversions int       `json:"total_conversions" db:"total_conversions"`
	ConversionRate   float64   `json:"conversion_rate" db:"conversion_rate"`
	AvgValue         *float64  `json:"avg_value,omitempty" db:"avg_value"`
	TotalValue       *float64  `json:"total_value,omitempty" db:"total_value"`
	AvgTimeToConvert *int      `json:"avg_time_to_convert,omitempty" db:"avg_time_to_convert"`
	AvgTimeToAbandon *int      `json:"avg_time_to_abandon,omitempty" db:"avg_time_to_abandon"`
	DropOffRate      float64   `json:"drop_off_rate" db:"drop_off_rate"`
	AbandonmentRate  float64   `json:"abandonment_rate" db:"abandonment_rate"`
}

type CreateFunnelRequest struct {
	Name        string      `json:"name" binding:"required"`
	Description *string     `json:"description"`
	WebsiteID   string      `json:"website_id" binding:"required"`
	UserID      *string     `json:"user_id,omitempty"`
	Steps       FunnelSteps `json:"steps" binding:"required"`
	IsActive    bool        `json:"is_active"`
}

type UpdateFunnelRequest struct {
	Name        *string      `json:"name"`
	Description *string      `json:"description"`
	WebsiteID   *string      `json:"website_id"`
	UserID      *string      `json:"user_id"`
	Steps       *FunnelSteps `json:"steps"`
	IsActive    *bool        `json:"is_active"`
}

// Advanced Analytics Models
type FunnelStepAnalytics struct {
	StepID          string   `json:"step_id" db:"step_id"`
	StepName        string   `json:"step_name" db:"step_name"`
	StepOrder       int      `json:"step_order" db:"step_order"`
	VisitorsReached int      `json:"visitors_reached" db:"visitors_reached"`
	ConversionRate  float64  `json:"conversion_rate" db:"conversion_rate"`
	DropOffRate     float64  `json:"drop_off_rate" db:"drop_off_rate"`
	AvgTimeOnStep   *float64 `json:"avg_time_on_step,omitempty" db:"avg_time_on_step"`
}

type DailyFunnelPerformance struct {
	Date           string  `json:"date" db:"date"`
	TotalStarts    int     `json:"total_starts" db:"total_starts"`
	Conversions    int     `json:"conversions" db:"conversions"`
	ConversionRate float64 `json:"conversion_rate" db:"conversion_rate"`
}

type FunnelCohortData struct {
	CohortDate       string  `json:"cohort_date" db:"cohort_date"`
	CohortSize       int     `json:"cohort_size" db:"cohort_size"`
	Conversions      int     `json:"conversions" db:"conversions"`
	ConversionRate   float64 `json:"conversion_rate" db:"conversion_rate"`
	AvgTimeToConvert int     `json:"avg_time_to_convert" db:"avg_time_to_convert"`
}

type DetailedFunnelAnalytics struct {
	FunnelID         uuid.UUID                `json:"funnel_id" db:"funnel_id"`
	WebsiteID        string                   `json:"website_id" db:"website_id"`
	StepAnalytics    []FunnelStepAnalytics    `json:"step_analytics" db:"step_analytics"`
	DailyPerformance []DailyFunnelPerformance `json:"daily_performance" db:"daily_performance"`
	CohortData       []FunnelCohortData       `json:"cohort_data" db:"cohort_data"`
	DateRange        int                      `json:"date_range" db:"date_range"`
}

// Funnel Comparison Models
type FunnelComparisonRequest struct {
	FunnelIDs []string `json:"funnel_ids" binding:"required"`
	DateRange int      `json:"date_range"`
	Metrics   []string `json:"metrics"` // conversion_rate, drop_off_rate, avg_time, etc.
}

type FunnelComparisonResult struct {
	FunnelID         string  `json:"funnel_id"`
	FunnelName       string  `json:"funnel_name"`
	TotalStarts      int     `json:"total_starts"`
	TotalConversions int     `json:"total_conversions"`
	ConversionRate   float64 `json:"conversion_rate"`
	DropOffRate      float64 `json:"drop_off_rate"`
	AvgTimeToConvert *int    `json:"avg_time_to_convert,omitempty"`
	PerformanceScore float64 `json:"performance_score"` // Calculated score for ranking
}
