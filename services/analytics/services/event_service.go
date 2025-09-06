package services

import (
	"analytics-app/models"
	"analytics-app/repository"
	"context"
	"fmt"
	"sync"
	"time"

	"analytics-app/utils"

	"github.com/rs/zerolog"
)

const (
	// Simple batch collection - much smaller batches, more frequent flushes
	BatchSize     = 50
	FlushInterval = 2 * time.Second
)

type EventService struct {
	repo   *repository.EventRepository
	logger zerolog.Logger

	// Simple event channel for async processing
	eventChan chan models.Event
	batchChan chan []models.Event

	// Shutdown control
	ctx        context.Context
	cancel     context.CancelFunc
	wg         sync.WaitGroup
	isShutdown bool
	shutdownMu sync.RWMutex
}

func NewEventService(repo *repository.EventRepository, logger zerolog.Logger) *EventService {
	ctx, cancel := context.WithCancel(context.Background())

	service := &EventService{
		repo:      repo,
		logger:    logger,
		eventChan: make(chan models.Event, 1000), // Buffered channel
		batchChan: make(chan []models.Event, 100),
		ctx:       ctx,
		cancel:    cancel,
	}

	// Start background workers
	service.startBatchCollector()
	service.startBatchProcessor()

	return service
}

func (s *EventService) TrackEvent(ctx context.Context, event *models.Event) (*models.EventResponse, error) {
	// Quick shutdown check
	s.shutdownMu.RLock()
	if s.isShutdown {
		s.shutdownMu.RUnlock()
		return nil, fmt.Errorf("service is shutdown")
	}
	s.shutdownMu.RUnlock()

	// Validate and set defaults
	if event.EventType == "" {
		event.EventType = "pageview"
	}
	if event.Timestamp.IsZero() {
		event.Timestamp = time.Now()
	}

	// Enrich event data
	s.enrichEventData(ctx, event)

	// Try to send to channel (non-blocking)
	select {
	case s.eventChan <- *event:
		s.logger.Debug().
			Str("website_id", event.WebsiteID).
			Str("visitor_id", event.VisitorID).
			Str("event_type", event.EventType).
			Msg("Event queued")
	default:
		// Channel full, log warning but don't block
		s.logger.Warn().Msg("Event channel full, dropping event")
		return nil, fmt.Errorf("event queue full")
	}

	return &models.EventResponse{
		Status:    "accepted",
		EventID:   event.ID.String(),
		VisitorID: event.VisitorID,
		SessionID: event.SessionID,
	}, nil
}

func (s *EventService) TrackBatchEvents(ctx context.Context, req *models.BatchEventRequest) (*models.BatchEventResponse, error) {
	s.shutdownMu.RLock()
	if s.isShutdown {
		s.shutdownMu.RUnlock()
		return nil, fmt.Errorf("service is shutdown")
	}
	s.shutdownMu.RUnlock()

	if len(req.Events) == 0 {
		return &models.BatchEventResponse{
			Status:      "success",
			EventsCount: 0,
			ProcessedAt: time.Now().Unix(),
		}, nil
	}

	// Process and enrich all events
	for i := range req.Events {
		if req.Events[i].WebsiteID == "" {
			req.Events[i].WebsiteID = req.SiteID
		}
		if req.Events[i].EventType == "" {
			req.Events[i].EventType = "pageview"
		}
		if req.Events[i].Timestamp.IsZero() {
			req.Events[i].Timestamp = time.Now()
		}

		s.enrichEventData(ctx, &req.Events[i])
	}

	// Send each event to the channel
	accepted := 0
	for _, event := range req.Events {
		select {
		case s.eventChan <- event:
			accepted++
		default:
			s.logger.Warn().Msg("Event channel full during batch")
			break
		}
	}

	return &models.BatchEventResponse{
		Status:      "accepted",
		EventsCount: accepted,
		ProcessedAt: time.Now().Unix(),
	}, nil
}

// startBatchCollector collects events into small batches
func (s *EventService) startBatchCollector() {
	s.wg.Add(1)
	go func() {
		defer s.wg.Done()

		ticker := time.NewTicker(FlushInterval)
		defer ticker.Stop()

		batch := make([]models.Event, 0, BatchSize)

		for {
			select {
			case <-s.ctx.Done():
				// Flush remaining batch before exit
				if len(batch) > 0 {
					s.sendBatch(batch)
				}
				close(s.batchChan)
				return

			case event := <-s.eventChan:
				batch = append(batch, event)

				// Send batch when it's full
				if len(batch) >= BatchSize {
					s.sendBatch(batch)
					batch = make([]models.Event, 0, BatchSize)
					ticker.Reset(FlushInterval) // Reset timer
				}

			case <-ticker.C:
				// Send batch on timer (even if not full)
				if len(batch) > 0 {
					s.sendBatch(batch)
					batch = make([]models.Event, 0, BatchSize)
				}
			}
		}
	}()
}

// sendBatch sends a batch to the processor
func (s *EventService) sendBatch(batch []models.Event) {
	batchCopy := make([]models.Event, len(batch))
	copy(batchCopy, batch)

	select {
	case s.batchChan <- batchCopy:
		s.logger.Debug().Int("batch_size", len(batchCopy)).Msg("Batch sent for processing")
	case <-s.ctx.Done():
		s.logger.Warn().Msg("Batch dropped during shutdown")
	default:
		s.logger.Warn().Msg("Batch channel full, dropping batch")
	}
}

// startBatchProcessor processes batches and writes to DB
func (s *EventService) startBatchProcessor() {
	s.wg.Add(1)
	go func() {
		defer s.wg.Done()

		for {
			select {
			case <-s.ctx.Done():
				// Process remaining batches
				for {
					select {
					case batch := <-s.batchChan:
						s.processBatch(batch)
					default:
						return
					}
				}

			case batch := <-s.batchChan:
				s.processBatch(batch)
			}
		}
	}()
}

// processBatch writes a batch to the database
func (s *EventService) processBatch(batch []models.Event) {
	if len(batch) == 0 {
		return
	}

	start := time.Now()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	s.logger.Info().Int("events_count", len(batch)).Msg("Processing batch")

	result, err := s.repo.CreateBatch(ctx, batch)
	if err != nil {
		s.logger.Error().
			Err(err).
			Int("events_count", len(batch)).
			Msg("Failed to process batch")
		return
	}

	duration := time.Since(start)
	s.logger.Info().
		Int("processed", result.Processed).
		Int("failed", result.Failed).
		Dur("duration", duration).
		Msg("Batch processed successfully")

	if result.Failed > 0 {
		s.logger.Warn().
			Int("failed_count", result.Failed).
			Msg("Some events failed in batch")
	}
}

// Shutdown gracefully shuts down the service
func (s *EventService) Shutdown(timeout time.Duration) error {
	s.logger.Info().Msg("Shutting down event service")

	// Mark as shutdown to prevent new events
	s.shutdownMu.Lock()
	s.isShutdown = true
	s.shutdownMu.Unlock()

	// Signal shutdown
	s.cancel()

	// Wait for workers to finish with timeout
	done := make(chan struct{})
	go func() {
		s.wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		s.logger.Info().Msg("Event service shutdown completed")
		return nil
	case <-time.After(timeout):
		s.logger.Warn().Msg("Event service shutdown timed out")
		return fmt.Errorf("shutdown timeout exceeded")
	}
}

func (s *EventService) GetEvents(ctx context.Context, websiteID string, limit int, offset int) ([]models.Event, error) {
	if websiteID == "" {
		return nil, fmt.Errorf("website_id is required")
	}
	if limit <= 0 || limit > 10000 {
		limit = 100
	}
	if offset < 0 {
		offset = 0
	}

	return s.repo.GetByWebsiteID(ctx, websiteID, limit, offset)
}

// GetStats returns service statistics
func (s *EventService) GetStats() map[string]interface{} {
	return map[string]interface{}{
		"event_queue_size": len(s.eventChan),
		"event_queue_cap":  cap(s.eventChan),
		"batch_queue_size": len(s.batchChan),
		"batch_queue_cap":  cap(s.batchChan),
		"batch_size":       BatchSize,
		"flush_interval":   FlushInterval.String(),
	}
}

func (s *EventService) enrichEventData(ctx context.Context, event *models.Event) {
	// Parse user agent if provided
	if event.UserAgent != nil && *event.UserAgent != "" {
		if (event.Browser == nil || *event.Browser == "") ||
			(event.Device == nil || *event.Device == "") ||
			(event.OS == nil || *event.OS == "") {

			uaInfo := utils.ParseUserAgent(*event.UserAgent)

			if event.Browser == nil || *event.Browser == "" {
				event.Browser = &uaInfo.Browser
			}
			if event.Device == nil || *event.Device == "" {
				event.Device = &uaInfo.Device
			}
			if event.OS == nil || *event.OS == "" {
				event.OS = &uaInfo.OS
			}
		}
	}

	// Get geolocation from IP
	if (event.Country == nil || *event.Country == "") &&
		(event.IPAddress != nil && *event.IPAddress != "") {

		location := utils.GetLocationFromIP(*event.IPAddress)
		if event.Country == nil || *event.Country == "" {
			event.Country = &location.Country
		}
		if event.City == nil || *event.City == "" {
			event.City = &location.City
		}
	}
}
