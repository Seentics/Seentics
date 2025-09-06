package cache

import "fmt"

// ValidateWebsite checks cache first, then calls the validation endpoint
func ValidateWebsite(websiteID, domain string) (map[string]interface{}, error) {
	cacheKey := CreateValidationCacheKey(websiteID, domain)

	// 1. Check Redis cache first
	if cachedData, err := GetCachedData(cacheKey); err == nil {
		return cachedData, nil
	}

	// 2. Call validation service
	url := fmt.Sprintf("%s/api/v1/user/websites/validate", USER_SERVICE_URL)
	payload := ValidationRequest{
		WebsiteID: websiteID,
		Domain:    domain,
	}

	validationResp, err := makeValidationRequest(url, payload)
	if err != nil {
		return nil, err
	}

	if !validationResp.Success {
		return nil, fmt.Errorf("validation failed: %s", validationResp.Message)
	}

	// 3. Convert to map for compatibility with existing code
	websiteData := map[string]interface{}{
		"id":         validationResp.Data.WebsiteID,
		"domain":     validationResp.Data.Domain,
		"name":       validationResp.Data.WebsiteName,
		"isVerified": validationResp.Data.IsVerified,
		"isActive":   true, // If validation passed, website is active
	}

	// 4. Cache the result
	if err := CacheData(cacheKey, websiteData, VALIDATION_CACHE_TTL); err != nil {
		// Failed to cache validation data
	}

	return websiteData, nil
}

// ValidateJWTToken checks cache first, then calls auth service
func ValidateJWTToken(token string) (map[string]interface{}, error) {
	// Hash token for security in cache key
	tokenHash := HashToken(token)
	cacheKey := fmt.Sprintf("token:%s", tokenHash)

	// 1. Check Redis cache first
	if cachedData, err := GetCachedData(cacheKey); err == nil {
		return cachedData, nil
	}

	// 2. Call auth service to validate token
	url := fmt.Sprintf("%s/api/v1/user/auth/validate", USER_SERVICE_URL)
	payload := map[string]interface{}{
		"token": token,
	}

	userData, err := makeAuthServicePOST(url, payload)
	if err != nil {
		return nil, err
	}

	// 3. Cache the result with shorter TTL for security
	if err := CacheData(cacheKey, userData, TOKEN_CACHE_TTL); err != nil {
		// Failed to cache token data
	}

	return userData, nil
}

// ValidateWebsiteOwnership checks if user owns website
func ValidateWebsiteOwnership(userID, websiteID string) (map[string]interface{}, error) {
	cacheKey := fmt.Sprintf("website:%s", websiteID)

	// 1. Check Redis cache first
	if cachedData, err := GetCachedData(cacheKey); err == nil {
		// Check ownership
		if cachedUserID, ok := cachedData["userId"].(string); ok && cachedUserID == userID {
			return cachedData, nil
		} else {
			return nil, fmt.Errorf("user %s does not own website %s", userID, websiteID)
		}
	}

	// 2. Call auth service
	url := fmt.Sprintf("%s/api/v1/users/websites/%s", USER_SERVICE_URL, websiteID)
	websiteData, err := makeAuthServiceRequest(url)
	if err != nil {
		return nil, err
	}

	// 3. Verify ownership
	if websiteUserID, ok := websiteData["userId"].(string); !ok || websiteUserID != userID {
		return nil, fmt.Errorf("user %s does not own website %s", userID, websiteID)
	}

	// 4. Cache the result
	if err := CacheData(cacheKey, websiteData, WEBSITE_CACHE_TTL); err != nil {
		// Failed to cache website data
	}

	return websiteData, nil
}
