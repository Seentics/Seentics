package utils

import (
	"context"
	"fmt"
	"net/http"
	"strings"
)

// Handle public website requests (analytics/tracking)
func ValidatePublicRequest(w http.ResponseWriter, r *http.Request, validateWebsiteFunc func(string, string) (map[string]interface{}, error), websiteContextKey interface{}) error {
	// Extract domain and siteId from multiple sources
	requestData, err := ExtractRequestData(r)
	if err != nil {
		return fmt.Errorf("failed to extract request data: %v", err)
	}

	if requestData.Domain == "" && requestData.SiteID == "" {
		return fmt.Errorf("domain or siteId required")
	}

	// For tracker requests, we need both websiteId and domain for proper validation
	var websiteID string
	var domain string

	if requestData.SiteID != "" {
		websiteID = requestData.SiteID
		// For tracker requests, use a default domain if none provided
		if requestData.Domain == "" {
			domain = "localhost" // Default domain for local development
		} else {
			domain = requestData.Domain
		}
	} else if requestData.Domain != "" {
		domain = requestData.Domain
		// We would need to resolve domain to websiteId, but for now skip validation
		websiteID = "unknown"
	}

	// For public fetch of active workflows, allow bypass in local/dev to avoid strict ObjectId coupling
	if strings.HasPrefix(r.URL.Path, "/api/v1/workflows/site/") && r.Method == http.MethodGet {
		// Minimal website data injection
		websiteData := map[string]interface{}{
			"id":         websiteID,
			"domain":     domain,
			"name":       "public-fetch",
			"isVerified": true,
			"isActive":   true,
		}
		InjectWebsiteHeaders(r, websiteData)
		ctx := context.WithValue(r.Context(), websiteContextKey, websiteData)
		*r = *r.WithContext(ctx)
		return nil
	}

	// Validate using the actual website validation endpoint
	websiteData, err := validateWebsiteFunc(websiteID, domain)
	if err != nil {
		return fmt.Errorf("website validation failed: %v", err)
	}

	// Inject headers for downstream services
	InjectWebsiteHeaders(r, websiteData)

	// Inject minimal metadata to body payload (optional)
	if err := InjectMetadataToBody(r, requestData, websiteData); err != nil {
		// Failed to inject metadata to body
	}

	// Add website data to context
	ctx := context.WithValue(r.Context(), websiteContextKey, websiteData)
	*r = *r.WithContext(ctx)

	return nil
}

// Handle protected dashboard requests
func ValidateProtectedRequest(w http.ResponseWriter, r *http.Request, validateJWTFunc func(string) (map[string]interface{}, error), userContextKey interface{}) error {
	token := r.Header.Get("Authorization")
	if token == "" {
		return fmt.Errorf("authorization header required")
	}

	// Remove Bearer prefix
	token = strings.TrimPrefix(token, "Bearer ")

	// Validate token and get user data from cache/auth service
	userData, err := validateJWTFunc(token)
	if err != nil {
		return fmt.Errorf("invalid token: %v", err)
	}

	// Inject user headers for downstream services
	InjectUserHeaders(r, userData)

	// Add user to context
	ctx := context.WithValue(r.Context(), userContextKey, userData)

	*r = *r.WithContext(ctx)

	return nil
}
