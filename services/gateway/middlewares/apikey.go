package middlewares

import (
	"net/http"
	"os"
)

// InterServiceAPIKeyMiddleware validates global API key for inter-service communication
// This is used when the gateway forwards requests to other services
func InterServiceAPIKeyMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get global API key from environment
		expectedAPIKey := os.Getenv("GLOBAL_API_KEY")
		if expectedAPIKey == "" {
			http.Error(w, "API key not configured", http.StatusInternalServerError)
			return
		}

		// Get API key from request header
		providedAPIKey := r.Header.Get("X-API-Key")
		if providedAPIKey == "" {
			http.Error(w, "Missing API key", http.StatusUnauthorized)
			return
		}

		// Validate API key using simple string comparison
		if providedAPIKey != expectedAPIKey {
			http.Error(w, "Invalid API key", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}
