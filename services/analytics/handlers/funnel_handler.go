package handlers

import (
	"analytics-app/models"
	"analytics-app/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rs/zerolog"
)

type FunnelHandler struct {
	service *services.FunnelService
	logger  zerolog.Logger
}

func NewFunnelHandler(service *services.FunnelService, logger zerolog.Logger) *FunnelHandler {
	return &FunnelHandler{
		service: service,
		logger:  logger,
	}
}

func (h *FunnelHandler) CreateFunnel(c *gin.Context) {
	var req models.CreateFunnelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("Failed to bind funnel data")
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid funnel data",
			"details": err.Error(),
		})
		return
	}

	funnel, err := h.service.CreateFunnel(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error().Err(err).Msg("Failed to create funnel")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create funnel"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"funnel": funnel})
}

func (h *FunnelHandler) GetFunnels(c *gin.Context) {
	websiteID := c.Query("website_id")
	if websiteID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "website_id is required"})
		return
	}

	funnels, err := h.service.GetFunnels(c.Request.Context(), websiteID)
	if err != nil {
		h.logger.Error().Err(err).Msg("Failed to get funnels")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get funnels"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"funnels": funnels})
}

// GetActiveFunnels - Public endpoint for tracker to fetch active funnels
func (h *FunnelHandler) GetActiveFunnels(c *gin.Context) {
	websiteID := c.Query("website_id")
	if websiteID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "website_id is required"})
		return
	}

	funnels, err := h.service.GetFunnels(c.Request.Context(), websiteID)
	if err != nil {
		h.logger.Error().Err(err).Msg("Failed to get active funnels")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get active funnels"})
		return
	}

	// Filter only active funnels and remove sensitive data
	var activeFunnels []models.Funnel
	for _, funnel := range funnels {
		if funnel.IsActive {
			// Create a public version without sensitive fields
			publicFunnel := models.Funnel{
				ID:          funnel.ID,
				Name:        funnel.Name,
				Description: funnel.Description,
				WebsiteID:   funnel.WebsiteID,
				Steps:       funnel.Steps,
				IsActive:    funnel.IsActive,
				CreatedAt:   funnel.CreatedAt,
				UpdatedAt:   funnel.UpdatedAt,
				// Don't include UserID in public response
			}
			activeFunnels = append(activeFunnels, publicFunnel)
		}
	}

	c.JSON(http.StatusOK, activeFunnels)
}

func (h *FunnelHandler) GetFunnel(c *gin.Context) {
	funnelIDStr := c.Param("funnel_id")
	funnelID, err := uuid.Parse(funnelIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid funnel ID"})
		return
	}

	funnel, err := h.service.GetFunnel(c.Request.Context(), funnelID)
	if err != nil {
		h.logger.Error().Err(err).Msg("Failed to get funnel")
		c.JSON(http.StatusNotFound, gin.H{"error": "Funnel not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"funnel": funnel})
}

func (h *FunnelHandler) UpdateFunnel(c *gin.Context) {
	funnelIDStr := c.Param("funnel_id")
	funnelID, err := uuid.Parse(funnelIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid funnel ID"})
		return
	}

	var req models.UpdateFunnelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("Failed to bind funnel update data")
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid funnel data",
			"details": err.Error(),
		})
		return
	}

	funnel, err := h.service.UpdateFunnel(c.Request.Context(), funnelID, &req)
	if err != nil {
		h.logger.Error().Err(err).Msg("Failed to update funnel")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update funnel"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"funnel": funnel})
}

func (h *FunnelHandler) DeleteFunnel(c *gin.Context) {
	funnelIDStr := c.Param("funnel_id")
	funnelID, err := uuid.Parse(funnelIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid funnel ID"})
		return
	}

	err = h.service.DeleteFunnel(c.Request.Context(), funnelID)
	if err != nil {
		h.logger.Error().Err(err).Msg("Failed to delete funnel")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete funnel"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "deleted"})
}

func (h *FunnelHandler) TrackFunnelEvent(c *gin.Context) {
	var event models.FunnelEvent
	if err := c.ShouldBindJSON(&event); err != nil {
		h.logger.Error().Err(err).Msg("Failed to bind funnel event data")
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid funnel event data",
			"details": err.Error(),
		})
		return
	}

	err := h.service.TrackFunnelEvent(c.Request.Context(), &event)
	if err != nil {
		h.logger.Error().Err(err).Msg("Failed to track funnel event")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to track funnel event"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":     "success",
		"funnel_id":  event.FunnelID,
		"visitor_id": event.VisitorID,
		"session_id": event.SessionID,
	})
}

func (h *FunnelHandler) GetFunnelAnalytics(c *gin.Context) {
	funnelIDStr := c.Param("funnel_id")
	funnelID, err := uuid.Parse(funnelIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid funnel ID"})
		return
	}

	days := 7
	if d := c.Query("days"); d != "" {
		if parsedDays, err := strconv.Atoi(d); err == nil && parsedDays > 0 {
			days = parsedDays
		}
	}

	analytics, err := h.service.GetFunnelAnalytics(c.Request.Context(), funnelID, days)
	if err != nil {
		h.logger.Error().Err(err).Msg("Failed to get funnel analytics")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get funnel analytics"})
		return
	}

	c.JSON(http.StatusOK, analytics)
}

func (h *FunnelHandler) GetDetailedFunnelAnalytics(c *gin.Context) {
	funnelIDStr := c.Param("funnel_id")
	funnelID, err := uuid.Parse(funnelIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid funnel ID"})
		return
	}

	days := 7
	if d := c.Query("days"); d != "" {
		if parsedDays, err := strconv.Atoi(d); err == nil && parsedDays > 0 {
			days = parsedDays
		}
	}

	analytics, err := h.service.GetDetailedFunnelAnalytics(c.Request.Context(), funnelID, days)
	if err != nil {
		h.logger.Error().Err(err).Msg("Failed to get detailed funnel analytics")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get detailed funnel analytics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   analytics,
	})
}

func (h *FunnelHandler) CompareFunnels(c *gin.Context) {
	websiteID := c.Query("website_id")
	if websiteID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "website_id is required"})
		return
	}

	var req models.FunnelComparisonRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error().Err(err).Msg("Failed to bind comparison request")
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid comparison request",
			"details": err.Error(),
		})
		return
	}

	days := 7
	if req.DateRange > 0 {
		days = req.DateRange
	}

	results, err := h.service.CompareFunnels(c.Request.Context(), websiteID, req.FunnelIDs, days)
	if err != nil {
		h.logger.Error().Err(err).Msg("Failed to compare funnels")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to compare funnels"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   results,
	})
}
