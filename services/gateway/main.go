package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/seentics/seentics/services/gateway/cache"
	middlewares "github.com/seentics/seentics/services/gateway/middlewares"
)

func main() {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found or failed to load")
	}

	mux := http.NewServeMux()

	redis_err := cache.InitRedis(os.Getenv("REDIS_URL"))

	if redis_err != nil {
		log.Fatal("Redis connection error:", redis_err)
	}

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Response from gateway"))
	})

	// Webhook test endpoint - logs all incoming webhook data
	mux.HandleFunc("/webhook-test", func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Read the request body
		body, err := io.ReadAll(r.Body)
		if err != nil {
			log.Printf("Error reading webhook body: %v", err)
			http.Error(w, "Error reading request body", http.StatusBadRequest)
			return
		}

		// Log the webhook data
		log.Printf("🔗 WEBHOOK RECEIVED:")
		log.Printf("Method: %s", r.Method)
		log.Printf("URL: %s", r.URL.String())
		log.Printf("Headers: %v", r.Header)
		log.Printf("Body: %s", string(body))

		// Try to parse JSON for pretty logging
		var jsonData interface{}
		if err := json.Unmarshal(body, &jsonData); err == nil {
			prettyJSON, _ := json.MarshalIndent(jsonData, "", "  ")
			log.Printf("Parsed JSON:\n%s", string(prettyJSON))
		}

		// Respond with success
		response := map[string]interface{}{
			"success":     true,
			"message":     "Webhook received successfully",
			"timestamp":   time.Now().Format(time.RFC3339),
			"method":      r.Method,
			"headers":     r.Header,
			"body_length": len(body),
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})

	// Routes
	mux.HandleFunc("/api/v1/user/", func(w http.ResponseWriter, r *http.Request) {
		proxyTo(w, r, os.Getenv("USER_SERVICE_URL"))
	})

	mux.HandleFunc("/api/v1/analytics/", func(w http.ResponseWriter, r *http.Request) {
		proxyTo(w, r, os.Getenv("ANALYTICS_SERVICE_URL"))
	})

	mux.HandleFunc("/api/v1/workflows/", func(w http.ResponseWriter, r *http.Request) {
		proxyTo(w, r, os.Getenv("WORKFLOW_SERVICE_URL"))
	})

	// Funnel routes - route to analytics service
	mux.HandleFunc("/api/v1/funnels/", func(w http.ResponseWriter, r *http.Request) {
		proxyTo(w, r, os.Getenv("ANALYTICS_SERVICE_URL"))
	})

	// Workflows routes without v1 - route to workflows service
	mux.HandleFunc("/api/workflows/", func(w http.ResponseWriter, r *http.Request) {
		proxyTo(w, r, os.Getenv("WORKFLOW_SERVICE_URL"))
	})

	// Funnel events routes - route to workflows service
	mux.HandleFunc("/api/funnel-events/", func(w http.ResponseWriter, r *http.Request) {
		proxyTo(w, r, os.Getenv("WORKFLOW_SERVICE_URL"))
	})

	// Admin service routes
	mux.HandleFunc("/api/v1/admin/", func(w http.ResponseWriter, r *http.Request) {
		proxyTo(w, r, os.Getenv("ADMIN_SERVICE_URL"))
	})

	// Privacy routes - route to appropriate services based on GDPR requirements
	mux.HandleFunc("/api/v1/privacy/", func(w http.ResponseWriter, r *http.Request) {
		// Route privacy requests based on the specific endpoint
		path := r.URL.Path

		// Analytics privacy operations (export, delete, anonymize analytics data)
		if contains(path, "/export/") || contains(path, "/delete/") || contains(path, "/anonymize/") ||
			contains(path, "/retention-policies") || contains(path, "/cleanup") {
			proxyTo(w, r, os.Getenv("ANALYTICS_SERVICE_URL"))
		} else {
			// User privacy operations (settings, requests, compliance status)
			proxyTo(w, r, os.Getenv("USER_SERVICE_URL"))
		}
	})

	// User privacy routes - route to user service
	mux.HandleFunc("/api/v1/user/privacy/", func(w http.ResponseWriter, r *http.Request) {
		proxyTo(w, r, os.Getenv("USER_SERVICE_URL"))
	})

	// Analytics privacy routes - route to analytics service
	mux.HandleFunc("/api/v1/analytics/privacy/", func(w http.ResponseWriter, r *http.Request) {
		proxyTo(w, r, os.Getenv("ANALYTICS_SERVICE_URL"))
	})

	handler := middlewares.ApplyMiddleware(mux, middlewares.LoggingMiddleware, middlewares.CORSMiddleware, middlewares.RateLimiterMiddleware, middlewares.AuthMiddleware)

	port := os.Getenv("API_GATEWAY_PORT")
	if port == "" {
		port = "8080" // default port
	}

	log.Printf("Gateway is running on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

func proxyTo(w http.ResponseWriter, r *http.Request, target string) {
	targetURL, _ := url.Parse(target)
	proxy := httputil.NewSingleHostReverseProxy(targetURL)

	// Add timeout configuration
	proxy.Transport = &http.Transport{
		ResponseHeaderTimeout: 30 * time.Second,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
	}

	// Add API key header for inter-service communication
	globalAPIKey := os.Getenv("GLOBAL_API_KEY")
	if globalAPIKey != "" {
		r.Header.Set("X-API-Key", globalAPIKey)
	}

	proxy.ServeHTTP(w, r)
}

// Helper function to check if a string contains a substring
func contains(s, substr string) bool {
	return strings.Contains(s, substr)
}
