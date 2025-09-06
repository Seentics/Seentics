package cache

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"time"
)

// Helper function to cache data in Redis
func CacheData(key string, data map[string]interface{}, ttl time.Duration) error {
	ctx := context.Background()

	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal cache data: %v", err)
	}

	return redisClient.Set(ctx, key, jsonData, ttl).Err()
}

// Helper function to get data from Redis cache
func GetCachedData(key string) (map[string]interface{}, error) {
	ctx := context.Background()

	val, err := redisClient.Get(ctx, key).Result()
	if err != nil {
		return nil, err
	}

	var data map[string]interface{}
	if err := json.Unmarshal([]byte(val), &data); err != nil {
		return nil, fmt.Errorf("failed to unmarshal cached data: %v", err)
	}

	return data, nil
}

// Helper function to hash token for security
func HashToken(token string) string {
	h := sha256.New()
	h.Write([]byte(token))
	return fmt.Sprintf("%x", h.Sum(nil))
}

// Helper function to create validation cache key
func CreateValidationCacheKey(websiteID, domain string) string {
	h := sha256.New()
	h.Write([]byte(fmt.Sprintf("%s:%s", websiteID, domain)))
	return fmt.Sprintf("validation:%x", h.Sum(nil))
}

// Cache clearing functions

// ClearUserCache clears user-related cache entries
func ClearUserCache(userID string) error {
	ctx := context.Background()

	// Clear user's websites cache
	pattern := fmt.Sprintf("website:*")
	keys, err := redisClient.Keys(ctx, pattern).Result()
	if err != nil {
		return err
	}

	for _, key := range keys {
		// Get website data to check if it belongs to this user
		if data, err := GetCachedData(key); err == nil {
			if websiteUserID, ok := data["userId"].(string); ok && websiteUserID == userID {
				redisClient.Del(ctx, key)
			}
		}
	}

	return nil
}

// ClearWebsiteCache clears specific website cache
func ClearWebsiteCache(websiteID string) error {
	ctx := context.Background()

	keys := []string{
		fmt.Sprintf("website:%s", websiteID),
	}

	// Also clear domain and siteId caches for this website
	// This requires getting the website data first
	if data, err := GetCachedData(fmt.Sprintf("website:%s", websiteID)); err == nil {
		if domain, ok := data["domain"].(string); ok {
			keys = append(keys, fmt.Sprintf("domain:%s", domain))
		}
		if siteID, ok := data["siteId"].(string); ok {
			keys = append(keys, fmt.Sprintf("siteId:%s", siteID))
		}
	}

	return redisClient.Del(ctx, keys...).Err()
}

// ClearValidationCache clears validation cache entries
func ClearValidationCache(websiteID, domain string) error {
	ctx := context.Background()
	cacheKey := CreateValidationCacheKey(websiteID, domain)
	return redisClient.Del(ctx, cacheKey).Err()
}

// ClearAllValidationCache clears all validation cache entries
func ClearAllValidationCache() error {
	ctx := context.Background()
	pattern := "validation:*"
	keys, err := redisClient.Keys(ctx, pattern).Result()
	if err != nil {
		return err
	}

	if len(keys) > 0 {
		return redisClient.Del(ctx, keys...).Err()
	}

	return nil
}

// ClearTokenCache clears specific token cache
func ClearTokenCache(token string) error {
	ctx := context.Background()
	tokenHash := HashToken(token)
	cacheKey := fmt.Sprintf("token:%s", tokenHash)
	return redisClient.Del(ctx, cacheKey).Err()
}
