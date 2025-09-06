package cache

import (
	"context"
	"fmt"
)

// GetCacheStats returns cache statistics
func GetCacheStats() (map[string]interface{}, error) {
	ctx := context.Background()

	info, err := redisClient.Info(ctx, "memory").Result()
	if err != nil {
		return nil, err
	}

	// Count keys by type
	domainKeys, _ := redisClient.Keys(ctx, "domain:*").Result()
	siteIdKeys, _ := redisClient.Keys(ctx, "siteId:*").Result()
	tokenKeys, _ := redisClient.Keys(ctx, "token:*").Result()
	websiteKeys, _ := redisClient.Keys(ctx, "website:*").Result()
	validationKeys, _ := redisClient.Keys(ctx, "validation:*").Result()

	stats := map[string]interface{}{
		"memory_info":     info,
		"domain_keys":     len(domainKeys),
		"siteId_keys":     len(siteIdKeys),
		"token_keys":      len(tokenKeys),
		"website_keys":    len(websiteKeys),
		"validation_keys": len(validationKeys),
		"total_keys":      len(domainKeys) + len(siteIdKeys) + len(tokenKeys) + len(websiteKeys) + len(validationKeys),
	}

	return stats, nil
}

// WarmValidationCache pre-populates validation cache for frequently accessed websites
func WarmValidationCache(websiteValidations []ValidationRequest) error {

	for _, validation := range websiteValidations {
		// Call ValidateWebsite which will cache the result
		_, err := ValidateWebsite(validation.WebsiteID, validation.Domain)
		if err != nil {
			fmt.Printf("⚠️ Failed to warm cache for websiteId=%s, domain=%s: %v\n",
				validation.WebsiteID, validation.Domain, err)
			continue
		}

		fmt.Printf("✅ Warmed cache for websiteId=%s, domain=%s\n",
			validation.WebsiteID, validation.Domain)
	}

	return nil
}
