package services

import (
	"analytics-app/models"
	"analytics-app/repository"
	"context"
	"fmt"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"github.com/rs/zerolog"
)

type FunnelService struct {
	repo   *repository.FunnelRepository
	logger zerolog.Logger
}

func NewFunnelService(repo *repository.FunnelRepository, logger zerolog.Logger, redisClient *redis.Client) *FunnelService {
	return &FunnelService{
		repo:   repo,
		logger: logger,
	}
}

func (s *FunnelService) CreateFunnel(ctx context.Context, req *models.CreateFunnelRequest) (*models.Funnel, error) {
	s.logger.Info().
		Str("website_id", req.WebsiteID).
		Str("funnel_name", req.Name).
		Msg("Creating funnel")

	funnel := &models.Funnel{
		Name:        req.Name,
		Description: req.Description,
		WebsiteID:   req.WebsiteID,
		UserID:      req.UserID,
		Steps:       req.Steps,
		IsActive:    req.IsActive,
	}

	err := s.repo.Create(ctx, funnel)
	if err != nil {
		s.logger.Error().Err(err).Msg("Failed to create funnel")
		return nil, err
	}

	return funnel, nil
}

func (s *FunnelService) GetFunnels(ctx context.Context, websiteID string) ([]models.Funnel, error) {
	s.logger.Info().
		Str("website_id", websiteID).
		Msg("Getting funnels")

	return s.repo.GetByWebsiteID(ctx, websiteID)
}

func (s *FunnelService) GetFunnel(ctx context.Context, funnelID uuid.UUID) (*models.Funnel, error) {
	s.logger.Info().
		Str("funnel_id", funnelID.String()).
		Msg("Getting funnel")

	return s.repo.GetByID(ctx, funnelID)
}

func (s *FunnelService) UpdateFunnel(ctx context.Context, funnelID uuid.UUID, req *models.UpdateFunnelRequest) (*models.Funnel, error) {
	s.logger.Info().
		Str("funnel_id", funnelID.String()).
		Msg("Updating funnel")

	// Get existing funnel
	funnel, err := s.repo.GetByID(ctx, funnelID)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.Name != nil {
		funnel.Name = *req.Name
	}
	if req.Description != nil {
		funnel.Description = req.Description
	}
	if req.Steps != nil {
		funnel.Steps = *req.Steps
	}
	if req.IsActive != nil {
		funnel.IsActive = *req.IsActive
	}

	err = s.repo.Update(ctx, funnelID, funnel)
	if err != nil {
		s.logger.Error().Err(err).Msg("Failed to update funnel")
		return nil, err
	}

	return funnel, nil
}

func (s *FunnelService) DeleteFunnel(ctx context.Context, funnelID uuid.UUID) error {
	s.logger.Info().
		Str("funnel_id", funnelID.String()).
		Msg("Deleting funnel")

	return s.repo.Delete(ctx, funnelID)
}

func (s *FunnelService) TrackFunnelEvent(ctx context.Context, event *models.FunnelEvent) error {
	s.logger.Info().
		Str("funnel_id", event.FunnelID.String()).
		Str("visitor_id", event.VisitorID).
		Int("current_step", event.CurrentStep).
		Msg("Tracking funnel event")

	// Validate funnel exists and belongs to website to avoid FK violations
	funnel, err := s.repo.GetByID(ctx, event.FunnelID)
	if err != nil {
		return fmt.Errorf("invalid funnel: %w", err)
	}
	if funnel.WebsiteID != event.WebsiteID {
		return fmt.Errorf("invalid funnel: funnel does not belong to website")
	}

	// Store the event in the database
	if err := s.repo.CreateFunnelEvent(ctx, event); err != nil {
		return err
	}

	// Funnel events are now handled client-side by workflow-tracker.js
	// No need to emit events to workflow service

	return nil
}

func (s *FunnelService) GetFunnelAnalytics(ctx context.Context, funnelID uuid.UUID, days int) (*models.FunnelAnalytics, error) {
	s.logger.Info().
		Str("funnel_id", funnelID.String()).
		Int("days", days).
		Msg("Getting funnel analytics")

	analytics, err := s.repo.GetFunnelAnalytics(ctx, funnelID, days)
	if err != nil {
		return nil, fmt.Errorf("failed to get funnel analytics: %w", err)
	}

	return analytics, nil
}

func (s *FunnelService) GetDetailedFunnelAnalytics(ctx context.Context, funnelID uuid.UUID, days int) (*models.DetailedFunnelAnalytics, error) {
	s.logger.Info().
		Str("funnel_id", funnelID.String()).
		Int("days", days).
		Msg("Getting detailed funnel analytics")

	analytics, err := s.repo.GetDetailedFunnelAnalytics(ctx, funnelID, days)
	if err != nil {
		return nil, fmt.Errorf("failed to get detailed funnel analytics: %w", err)
	}

	return analytics, nil
}

func (s *FunnelService) CompareFunnels(ctx context.Context, websiteID string, funnelIDs []string, days int) ([]models.FunnelComparisonResult, error) {
	s.logger.Info().
		Str("website_id", websiteID).
		Strs("funnel_ids", funnelIDs).
		Int("days", days).
		Msg("Comparing funnels")

	var results []models.FunnelComparisonResult

	for _, funnelIDStr := range funnelIDs {
		funnelID, err := uuid.Parse(funnelIDStr)
		if err != nil {
			s.logger.Error().Err(err).Str("funnel_id", funnelIDStr).Msg("Invalid funnel ID")
			continue
		}

		// Get funnel details
		funnel, err := s.repo.GetByID(ctx, funnelID)
		if err != nil {
			s.logger.Error().Err(err).Str("funnel_id", funnelIDStr).Msg("Failed to get funnel")
			continue
		}

		// Get analytics
		analytics, err := s.repo.GetFunnelAnalytics(ctx, funnelID, days)
		if err != nil {
			s.logger.Error().Err(err).Str("funnel_id", funnelIDStr).Msg("Failed to get funnel analytics")
			continue
		}

		// Calculate performance score (weighted combination of metrics)
		performanceScore := s.calculatePerformanceScore(analytics)

		result := models.FunnelComparisonResult{
			FunnelID:         funnelIDStr,
			FunnelName:       funnel.Name,
			TotalStarts:      analytics.TotalStarts,
			TotalConversions: analytics.TotalConversions,
			ConversionRate:   analytics.ConversionRate,
			DropOffRate:      analytics.DropOffRate,
			AvgTimeToConvert: analytics.AvgTimeToConvert,
			PerformanceScore: performanceScore,
		}

		results = append(results, result)
	}

	// Sort by performance score (highest first)
	for i := 0; i < len(results)-1; i++ {
		for j := i + 1; j < len(results); j++ {
			if results[i].PerformanceScore < results[j].PerformanceScore {
				results[i], results[j] = results[j], results[i]
			}
		}
	}

	return results, nil
}

func (s *FunnelService) calculatePerformanceScore(analytics *models.FunnelAnalytics) float64 {
	// Weighted scoring system:
	// - Conversion rate: 50% weight
	// - Drop-off rate: 30% weight (inverted - lower is better)
	// - Time to convert: 20% weight (inverted - lower is better)

	conversionScore := analytics.ConversionRate * 0.5

	dropOffScore := (100 - analytics.DropOffRate) * 0.3

	timeScore := 0.0
	if analytics.AvgTimeToConvert != nil {
		// Normalize time score (assume 10 minutes is perfect, 60 minutes is poor)
		timeMinutes := float64(*analytics.AvgTimeToConvert) / 60.0
		if timeMinutes <= 10 {
			timeScore = 100 * 0.2
		} else if timeMinutes <= 60 {
			timeScore = (60 - timeMinutes) / 50 * 100 * 0.2
		}
		// If more than 60 minutes, time score is 0
	}

	return conversionScore + dropOffScore + timeScore
}
