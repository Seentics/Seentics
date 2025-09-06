package utils

import (
	"context"
	"net"
)

// LocationInfo contains geolocation information
type LocationInfo struct {
	Country string `json:"country"`
	City    string `json:"city"`
}

// GetClientIP extracts the client IP address from the request context
func GetClientIP(ctx context.Context) string {
	if ctx == nil {
		return ""
	}

	// Try to get IP from context (set by middleware)
	if ip, ok := ctx.Value("client_ip").(string); ok && ip != "" {
		return ip
	}

	return ""
}

// GetLocationFromIP determines location from IP address using free geolocation service
func GetLocationFromIP(ip string) LocationInfo {
	if ip == "" {
		return LocationInfo{Country: "Unknown", City: "Unknown"}
	}

	// Handle localhost and private IPs
	if isPrivateIP(ip) {
		return LocationInfo{Country: "Local", City: "Local"}
	}

	// Use free geolocation service
	geoService := NewFreeGeoIPService()
	location, err := geoService.Lookup(ip)
	if err != nil {
		return LocationInfo{Country: "Unknown", City: "Unknown"}
	}

	return *location
}

// isPrivateIP checks if an IP address is private/local
func isPrivateIP(ip string) bool {
	parsedIP := net.ParseIP(ip)
	if parsedIP == nil {
		return false
	}

	// Check for private IP ranges
	privateRanges := []string{
		"10.0.0.0/8",     // Class A private
		"172.16.0.0/12",  // Class B private
		"192.168.0.0/16", // Class C private
		"127.0.0.0/8",    // Loopback
		"::1/128",        // IPv6 loopback
		"fc00::/7",       // IPv6 unique local
		"fe80::/10",      // IPv6 link local
	}

	for _, cidr := range privateRanges {
		_, network, err := net.ParseCIDR(cidr)
		if err != nil {
			continue
		}
		if network.Contains(parsedIP) {
			return true
		}
	}

	return false
}

// SetClientIPInContext sets the client IP in the context for middleware
func SetClientIPInContext(ctx context.Context, ip string) context.Context {
	return context.WithValue(ctx, "client_ip", ip)
}
