package utils

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// FreeGeoIPResponse contains the response from free geolocation APIs
type FreeGeoIPResponse struct {
	Country string `json:"country_code"`
	City    string `json:"city"`
	Region  string `json:"region"`
	IP      string `json:"ip"`
}

// FreeGeoIPService provides free IP geolocation using public APIs
type FreeGeoIPService struct {
	client *http.Client
}

// NewFreeGeoIPService creates a new free geolocation service
func NewFreeGeoIPService() *FreeGeoIPService {
	return &FreeGeoIPService{
		client: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

// Lookup performs a geolocation lookup using free APIs
func (f *FreeGeoIPService) Lookup(ip string) (*LocationInfo, error) {
	if ip == "" {
		return nil, fmt.Errorf("IP address is required")
	}

	// Skip private IPs
	if isPrivateIP(ip) {
		return &LocationInfo{Country: "Local", City: "Local"}, nil
	}

	// Try multiple free geolocation APIs for redundancy
	apis := []string{
		"http://ip-api.com/json/",
		"https://ipapi.co/",
		"https://freegeoip.app/json/",
	}

	for _, api := range apis {
		if location, err := f.lookupFromAPI(api, ip); err == nil {
			return location, nil
		}
	}

	// If all APIs fail, return Unknown
	return &LocationInfo{Country: "Unknown", City: "Unknown"}, nil
}

// lookupFromAPI performs lookup from a specific API
func (f *FreeGeoIPService) lookupFromAPI(apiURL, ip string) (*LocationInfo, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, "GET", apiURL+ip, nil)
	if err != nil {
		return nil, err
	}

	// Set user agent to avoid being blocked
	req.Header.Set("User-Agent", "Seentics-Analytics/1.0")

	resp, err := f.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var geoResp FreeGeoIPResponse
	if err := json.Unmarshal(body, &geoResp); err != nil {
		return nil, err
	}

	// Validate response
	if geoResp.Country == "" {
		return nil, fmt.Errorf("invalid response from API")
	}

	return &LocationInfo{
		Country: geoResp.Country,
		City:    geoResp.City,
	}, nil
}
