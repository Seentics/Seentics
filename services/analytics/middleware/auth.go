package middleware

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// APIKeyMiddleware validates global API key for all requests
func APIKeyMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get global API key from environment
		expectedAPIKey := os.Getenv("GLOBAL_API_KEY")
		if expectedAPIKey == "" {
			fmt.Printf("❌ GLOBAL_API_KEY not configured in analytics service\n")
			http.Error(w, "API key not configured", http.StatusInternalServerError)
			return
		}

		// Get API key from request header
		providedAPIKey := r.Header.Get("X-API-Key")
		if providedAPIKey == "" {
			fmt.Printf("❌ Missing X-API-Key header in analytics service\n")
			http.Error(w, "Missing API key", http.StatusUnauthorized)
			return
		}

		// Validate API key using simple string comparison
		if providedAPIKey != expectedAPIKey {
			fmt.Printf("❌ Invalid API key provided to analytics service\n")
			http.Error(w, "Invalid API key", http.StatusUnauthorized)
			return
		}

		fmt.Printf("✅ Global API key validation passed for analytics service\n")
		next.ServeHTTP(w, r)
	})
}

// GinAPIKeyMiddleware validates global API key for Gin requests
func GinAPIKeyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get global API key from environment
		expectedAPIKey := os.Getenv("GLOBAL_API_KEY")
		if expectedAPIKey == "" {
			fmt.Printf("❌ GLOBAL_API_KEY not configured in analytics service\n")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "API key not configured"})
			c.Abort()
			return
		}

		// Get API key from request header
		providedAPIKey := c.GetHeader("X-API-Key")
		if providedAPIKey == "" {
			fmt.Printf("❌ Missing X-API-Key header in analytics service\n")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing API key"})
			c.Abort()
			return
		}

		// Validate API key using simple string comparison
		if providedAPIKey != expectedAPIKey {
			fmt.Printf("❌ Invalid API key provided to analytics service\n")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid API key"})
			c.Abort()
			return
		}

		fmt.Printf("✅ Global API key validation passed for analytics service\n")
		c.Next()
	}
}
