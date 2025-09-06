package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog"
)

type HealthHandler struct {
	db     *pgxpool.Pool
	logger zerolog.Logger
}

func NewHealthHandler(db *pgxpool.Pool, logger zerolog.Logger) *HealthHandler {
	return &HealthHandler{
		db:     db,
		logger: logger,
	}
}

func (h *HealthHandler) HealthCheck(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	// Check database connection
	if err := h.db.Ping(ctx); err != nil {
		h.logger.Error().Err(err).Msg("Database health check failed")
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status":    "unhealthy",
			"database":  "disconnected",
			"error":     err.Error(),
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
		return
	}

	// Check TimescaleDB extension
	var hasTimescale bool
	err := h.db.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'timescaledb')").Scan(&hasTimescale)
	if err != nil {
		h.logger.Error().Err(err).Msg("TimescaleDB extension check failed")
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status":    "unhealthy",
			"database":  "connected",
			"timescale": "unknown",
			"error":     err.Error(),
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
		return
	}

	// Check if events table is a hypertable
	var isHypertable bool
	err = h.db.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM timescaledb_information.hypertables WHERE hypertable_name = 'events')").Scan(&isHypertable)
	if err != nil {
		h.logger.Warn().Err(err).Msg("Hypertable check failed")
		isHypertable = false
	}

	c.JSON(http.StatusOK, gin.H{
		"status":     "healthy",
		"database":   "connected",
		"timescale":  hasTimescale,
		"hypertable": isHypertable,
		"timestamp":  time.Now().UTC().Format(time.RFC3339),
		"version":    "1.0.0",
	})
}
