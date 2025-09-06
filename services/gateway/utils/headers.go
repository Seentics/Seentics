package utils

import (
	"fmt"
	"net/http"
	"time"
)

// Inject user headers for downstream services
func InjectUserHeaders(r *http.Request, userData map[string]interface{}) {
	if userID, ok := userData["id"].(string); ok {
		r.Header.Set("X-User-ID", userID)
	}
	if email, ok := userData["email"].(string); ok {
		r.Header.Set("X-User-Email", email)
	}
	if name, ok := userData["name"].(string); ok {
		r.Header.Set("X-User-Name", name)
	}
	if plan, ok := userData["plan"].(string); ok {
		r.Header.Set("X-User-Plan", plan)
	}
	if status, ok := userData["status"].(string); ok {
		r.Header.Set("X-User-Status", status)
	}
}

// Inject website headers for downstream services
func InjectWebsiteHeaders(r *http.Request, websiteData map[string]interface{}) {
	if websiteID, ok := websiteData["id"].(string); ok {
		r.Header.Set("X-Website-ID", websiteID)
	}
	if siteID, ok := websiteData["siteId"].(string); ok {
		r.Header.Set("X-Site-ID", siteID)
	}
	if userID, ok := websiteData["userId"].(string); ok {
		r.Header.Set("X-Website-User-ID", userID)
	}
	if domain, ok := websiteData["domain"].(string); ok {
		r.Header.Set("X-Website-Domain", domain)
	}
	if isActive, ok := websiteData["isActive"].(bool); ok {
		if isActive {
			r.Header.Set("X-Website-Active", "true")
		} else {
			r.Header.Set("X-Website-Active", "false")
		}
	}
}

// Optional helper to cache eventsSuspended flag from headers
func RefreshEventsSuspendedIfProvided(r *http.Request, cacheFunc func(string, map[string]interface{}, time.Duration) error, ttl time.Duration) {
	val := r.Header.Get("X-User-Events-Suspended")
	if val == "" {
		return
	}
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		return
	}
	key := fmt.Sprintf("user:%s:eventsSuspended", userID)
	data := map[string]interface{}{"eventsSuspended": val}

	_ = cacheFunc(key, data, ttl)
}
