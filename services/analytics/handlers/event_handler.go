package handlers

import (
	"analytics-app/models"
	"analytics-app/services"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
)

type EventHandler struct {
	service *services.EventService
	logger  zerolog.Logger
}

func NewEventHandler(service *services.EventService, logger zerolog.Logger) *EventHandler {
	return &EventHandler{
		service: service,
		logger:  logger,
	}
}

func (h *EventHandler) TrackEvent(c *gin.Context) {
	var event models.Event
	if err := c.ShouldBindJSON(&event); err != nil {
		h.logger.Error().Err(err).Msg("Failed to bind event data")
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid event data",
			"details": err.Error(),
		})
		return
	}

	// Validate required fields
	if event.WebsiteID == "" || event.VisitorID == "" {
		h.logger.Error().
			Str("website_id", event.WebsiteID).
			Str("visitor_id", event.VisitorID).
			Msg("Missing required fields")
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing required fields: website_id and visitor_id",
		})
		return
	}

	response, err := h.service.TrackEvent(c.Request.Context(), &event)
	if err != nil {
		h.logger.Error().Err(err).Msg("Failed to track event")
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to track event",
		})
		return
	}

	c.JSON(http.StatusCreated, response)
}

func (h *EventHandler) TrackBatchEvents(c *gin.Context) {
	var req models.BatchEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("Failed to bind batch event data")
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid batch event data",
			"details": err.Error(),
		})
		return
	}

	// Validate batch request
	if req.SiteID == "" || len(req.Events) == 0 {
		h.logger.Error().
			Str("site_id", req.SiteID).
			Int("events_count", len(req.Events)).
			Msg("Invalid batch request")
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing required fields: siteId and events",
		})
		return
	}

	// Validate individual events
	for i, event := range req.Events {
		if event.VisitorID == "" {
			h.logger.Error().
				Int("event_index", i).
				Msg("Event missing visitor_id")
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Event at index %d missing visitor_id", i),
			})
			return
		}
	}

	response, err := h.service.TrackBatchEvents(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error().Err(err).Msg("Failed to track batch events")
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to track batch events",
		})
		return
	}

	c.JSON(http.StatusCreated, response)
}
