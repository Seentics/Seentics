package services

import (
	"analytics-app/models"
	"analytics-app/repository"
	"context"
	"fmt"

	"github.com/rs/zerolog"
)

type AnalyticsService struct {
	repo   *repository.MainAnalyticsRepository
	logger zerolog.Logger
}

func NewAnalyticsService(repo *repository.MainAnalyticsRepository, logger zerolog.Logger) *AnalyticsService {
	return &AnalyticsService{
		repo:   repo,
		logger: logger,
	}
}

func (s *AnalyticsService) GetDashboard(ctx context.Context, websiteID string, days int) (*models.DashboardData, error) {
	s.logger.Info().
		Str("website_id", websiteID).
		Int("days", days).
		Msg("Getting dashboard data")

	metrics, err := s.repo.GetDashboardMetrics(ctx, websiteID, days)
	if err != nil {
		s.logger.Error().Err(err).Msg("Failed to get dashboard metrics")
		return nil, fmt.Errorf("failed to get dashboard metrics: %w", err)
	}

	// Get comparison data if available
	var comparison *models.ComparisonMetrics
	if days <= 30 { // Only calculate comparison for reasonable time ranges
		comparison, _ = s.repo.GetComparisonMetrics(ctx, websiteID, days)
	}

	// Get live visitors data
	s.logger.Info().
		Str("website_id", websiteID).
		Msg("Getting live visitors for dashboard")
	liveVisitors, err := s.repo.GetLiveVisitors(ctx, websiteID)
	if err != nil {
		s.logger.Error().Err(err).Msg("Failed to get live visitors")
		liveVisitors = 0
	}
	s.logger.Info().
		Str("website_id", websiteID).
		Int("live_visitors", liveVisitors).
		Msg("Retrieved live visitors for dashboard")

	return &models.DashboardData{
		WebsiteID:       websiteID,
		DateRange:       fmt.Sprintf("%d days", days),
		TotalVisitors:   metrics.TotalVisitors,
		UniqueVisitors:  metrics.UniqueVisitors,
		LiveVisitors:    liveVisitors,
		PageViews:       metrics.PageViews,
		SessionDuration: metrics.AvgSessionTime,
		BounceRate:      metrics.BounceRate,
		Comparison:      comparison,
	}, nil
}

func (s *AnalyticsService) GetTopPages(ctx context.Context, websiteID string, days, limit int) ([]models.PageStat, error) {
	s.logger.Info().
		Str("website_id", websiteID).
		Int("days", days).
		Int("limit", limit).
		Msg("Getting top pages")

	return s.repo.GetTopPages(ctx, websiteID, days, limit)
}

func (s *AnalyticsService) GetPageUTMBreakdown(ctx context.Context, websiteID, pagePath string, days int) (map[string]interface{}, error) {
	s.logger.Info().
		Str("website_id", websiteID).
		Str("page_path", pagePath).
		Int("days", days).
		Msg("Getting page UTM breakdown")

	return s.repo.GetPageUTMBreakdown(ctx, websiteID, pagePath, days)
}

func (s *AnalyticsService) GetTopReferrers(ctx context.Context, websiteID string, days, limit int) ([]models.ReferrerStat, error) {
	s.logger.Info().
		Str("website_id", websiteID).
		Int("days", days).
		Int("limit", limit).
		Msg("Getting top referrers")

	return s.repo.GetTopReferrers(ctx, websiteID, days, limit)
}

func (s *AnalyticsService) GetTopSources(ctx context.Context, websiteID string, days, limit int) ([]models.SourceStat, error) {
	s.logger.Info().
		Str("website_id", websiteID).
		Int("days", days).
		Int("limit", limit).
		Msg("Getting top sources")

	return s.repo.GetTopSources(ctx, websiteID, days, limit)
}

func (s *AnalyticsService) GetTopCountries(ctx context.Context, websiteID string, days, limit int) ([]models.CountryStat, error) {
	s.logger.Info().
		Str("website_id", websiteID).
		Int("days", days).
		Int("limit", limit).
		Msg("Getting top countries")

	return s.repo.GetTopCountries(ctx, websiteID, days, limit)
}

func (s *AnalyticsService) GetTopBrowsers(ctx context.Context, websiteID string, days, limit int) ([]models.BrowserStat, error) {
	s.logger.Info().
		Str("website_id", websiteID).
		Int("days", days).
		Int("limit", limit).
		Msg("Getting top browsers")

	return s.repo.GetTopBrowsers(ctx, websiteID, days, limit)
}

func (s *AnalyticsService) GetTopDevices(ctx context.Context, websiteID string, days, limit int) ([]models.DeviceStat, error) {
	s.logger.Info().
		Str("website_id", websiteID).
		Int("days", days).
		Int("limit", limit).
		Msg("Getting top devices")

	return s.repo.GetTopDevices(ctx, websiteID, days, limit)
}

func (s *AnalyticsService) GetTopOS(ctx context.Context, websiteID string, days, limit int) ([]models.OSStat, error) {
	s.logger.Info().
		Str("website_id", websiteID).
		Int("days", days).
		Int("limit", limit).
		Msg("Getting top operating systems")

	return s.repo.GetTopOS(ctx, websiteID, days, limit)
}

func (s *AnalyticsService) GetTrafficSummary(ctx context.Context, websiteID string, days int) (*models.TrafficSummary, error) {
	s.logger.Info().
		Str("website_id", websiteID).
		Int("days", days).
		Msg("Getting traffic summary")

	return s.repo.GetTrafficSummary(ctx, websiteID, days)
}

func (s *AnalyticsService) GetDailyStats(ctx context.Context, websiteID string, days int) ([]models.DailyStat, error) {
	s.logger.Info().
		Str("website_id", websiteID).
		Int("days", days).
		Msg("Getting daily statistics")

	return s.repo.GetDailyStats(ctx, websiteID, days)
}

func (s *AnalyticsService) GetHourlyStats(ctx context.Context, websiteID string, days int, timezone string) ([]models.HourlyStat, error) {
	s.logger.Info().
		Str("website_id", websiteID).
		Str("timezone", timezone).
		Msg("Getting hourly statistics (last 24 hours)")

	return s.repo.GetHourlyStats(ctx, websiteID, days, timezone)
}

func (s *AnalyticsService) GetCustomEvents(ctx context.Context, websiteID string, days int) ([]models.CustomEventStat, error) {
	s.logger.Info().
		Str("website_id", websiteID).
		Int("days", days).
		Msg("Getting custom events")

	return s.repo.GetCustomEventStats(ctx, websiteID, days)
}

// GetLiveVisitors returns the number of currently active visitors
func (s *AnalyticsService) GetLiveVisitors(ctx context.Context, websiteID string) (int, error) {
	s.logger.Info().
		Str("website_id", websiteID).
		Msg("Getting live visitors")

	return s.repo.GetLiveVisitors(ctx, websiteID)
}

func (s *AnalyticsService) GetUTMAnalytics(ctx context.Context, websiteID string, days int) (map[string]interface{}, error) {
	s.logger.Info().
		Str("website_id", websiteID).
		Int("days", days).
		Msg("Getting UTM analytics")

	return s.repo.GetUTMAnalytics(ctx, websiteID, days)
}
