package repository

import (
	"analytics-app/models"
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type TimeSeriesAnalytics struct {
	db *pgxpool.Pool
}

func NewTimeSeriesAnalytics(db *pgxpool.Pool) *TimeSeriesAnalytics {
	return &TimeSeriesAnalytics{db: db}
}

// GetDailyStats returns daily statistics for a website
func (ts *TimeSeriesAnalytics) GetDailyStats(ctx context.Context, websiteID string, days int) ([]models.DailyStat, error) {
	query := `
		SELECT 
			DATE(timestamp) as date,
			COUNT(*) as views,
			COUNT(DISTINCT visitor_id) as unique_visitors
		FROM events
		WHERE website_id = $1 
		AND timestamp >= NOW() - INTERVAL '1 day' * $2
		AND event_type = 'pageview'
		GROUP BY DATE(timestamp)
		ORDER BY date DESC
		LIMIT $2`

	rows, err := ts.db.Query(ctx, query, websiteID, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stats []models.DailyStat
	for rows.Next() {
		var stat models.DailyStat
		var uniqueVisitors int
		err := rows.Scan(&stat.Date, &stat.Views, &uniqueVisitors)
		if err != nil {
			continue
		}
		stat.Unique = uniqueVisitors
		stats = append(stats, stat)
	}

	return stats, nil
}

// GetHourlyStats returns hourly statistics for a website
func (ts *TimeSeriesAnalytics) GetHourlyStats(ctx context.Context, websiteID string, days int, timezone string) ([]models.HourlyStat, error) {
	query := `
		SELECT 
			EXTRACT(HOUR FROM timestamp)::integer as hour,
			DATE_TRUNC('hour', timestamp) as timestamp,
			COUNT(*) as views,
			COUNT(DISTINCT visitor_id) as unique_visitors
		FROM events
		WHERE website_id = $1 
		AND timestamp >= NOW() - INTERVAL '1 day' * $2
		AND event_type = 'pageview'
		GROUP BY DATE_TRUNC('hour', timestamp), EXTRACT(HOUR FROM timestamp)
		ORDER BY timestamp ASC
		LIMIT LEAST($2 * 24, 24*30)`

	rows, err := ts.db.Query(ctx, query, websiteID, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Load timezone
	loc, err := time.LoadLocation(timezone)
	if err != nil {
		// Fallback to UTC if timezone is invalid
		loc = time.UTC
	}

	var stats []models.HourlyStat
	for rows.Next() {
		var stat models.HourlyStat
		var timestamp time.Time
		var uniqueVisitors int
		err := rows.Scan(&stat.Hour, &timestamp, &stat.Views, &uniqueVisitors)
		if err != nil {
			continue
		}

		// Convert UTC timestamp to user's timezone
		localTime := timestamp.In(loc)
		stat.Timestamp = localTime
		stat.Unique = uniqueVisitors
		stat.Hour = localTime.Hour()
		stat.HourLabel = localTime.Format("15:04")
		stats = append(stats, stat)
	}

	return stats, nil
}
