package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// Inject metadata to body payload for downstream services (without modifying siteId/domain)
func InjectMetadataToBody(r *http.Request, requestData *RequestData, websiteData map[string]interface{}) error {
	// Only inject for POST/PUT/PATCH requests with JSON content
	if r.Method != "POST" && r.Method != "PUT" && r.Method != "PATCH" {
		return nil
	}

	contentType := r.Header.Get("Content-Type")
	if !strings.Contains(contentType, "application/json") {
		return nil
	}

	// Read the existing body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		return fmt.Errorf("failed to read request body: %v", err)
	}

	var bodyData map[string]interface{}

	// Parse existing JSON or create new map
	if len(body) > 0 {
		if err := json.Unmarshal(body, &bodyData); err != nil {
			// If body is not valid JSON, don't modify it
			r.Body = io.NopCloser(bytes.NewReader(body))
			return nil
		}
	} else {
		bodyData = make(map[string]interface{})
	}

	// Only add metadata about the request (don't inject siteId/domain)
	bodyData["_gateway"] = map[string]interface{}{
		"extractedFrom": requestData.Source,
		"timestamp":     time.Now().Unix(),
		"validated":     true,
	}

	// Marshal back to JSON
	modifiedBody, err := json.Marshal(bodyData)
	if err != nil {
		return fmt.Errorf("failed to marshal modified body: %v", err)
	}

	// Replace the body
	r.Body = io.NopCloser(bytes.NewReader(modifiedBody))
	r.ContentLength = int64(len(modifiedBody))

	return nil
}
