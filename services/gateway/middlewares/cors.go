package middlewares

import (
	"net/http"
	"os"
	"strings"
)

// CORS middleware
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		// Get CORS configuration from environment
		corsOrigins := getCORSOrigins()

		// Check if origin is allowed
		if isOriginAllowed(origin, corsOrigins) {
			// Only set headers if they haven't been set already
			if w.Header().Get("Access-Control-Allow-Origin") == "" {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Credentials", "true")
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Site-ID, X-Domain")
			}
		}

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// getCORSOrigins returns allowed CORS origins from environment
func getCORSOrigins() []string {
	corsConfig := os.Getenv("CORS_ORIGIN")
	if corsConfig == "" {
		// Default fallback for development
		return []string{"http://localhost:3000", "http://localhost:3001", "http://localhost:8080"}
	}
	return strings.Split(corsConfig, ",")
}

// isOriginAllowed checks if the request origin is in the allowed list
func isOriginAllowed(origin string, allowedOrigins []string) bool {
	for _, allowed := range allowedOrigins {
		if strings.TrimSpace(allowed) == origin {
			return true
		}
	}
	return false
}
