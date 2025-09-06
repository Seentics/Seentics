package middlewares

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/seentics/seentics/services/gateway/cache"
	"github.com/seentics/seentics/services/gateway/utils"
)

// Simple rate limit rules
var rateLimits = map[string]struct {
	requests int
	window   time.Duration
}{
	"public":      {1000, time.Hour}, // 1000/hour for tracking
	"protected":   {5000, time.Hour}, // 5000/hour for dashboard
	"unprotected": {100, time.Hour},  // 100/hour for general
	"auth":        {100, time.Hour},  // 20/hour for auth
}

// Rate limiter middleware
func RateLimiterMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Determine route type
		routeType := "unprotected"
		if strings.HasPrefix(r.URL.Path, "/api/v1/auth/") {
			routeType = "auth"
		} else {
			routeType = utils.GetRouteType(r.URL.Path)
		}

		// Get rate limit config
		config, exists := rateLimits[routeType]
		if !exists {
			next.ServeHTTP(w, r)
			return
		}

		// Create rate limit key
		identifier := utils.GetRateLimitID(r, routeType)
		key := fmt.Sprintf("rate:%s:%s", routeType, identifier)

		// Check rate limit
		allowed, count, err := utils.CheckRateLimit(cache.GetRedisClient(), key, config.requests, config.window)
		if err != nil {
			next.ServeHTTP(w, r) // Continue on error
			return
		}

		// Add headers
		w.Header().Set("X-RateLimit-Limit", strconv.Itoa(config.requests))
		w.Header().Set("X-RateLimit-Remaining", strconv.Itoa(config.requests-count))

		if !allowed {
			http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}
