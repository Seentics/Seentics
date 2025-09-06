package cache

import (
	"context"
	"fmt"
	"os"

	"github.com/go-redis/redis/v8"
)

// Redis client
var redisClient *redis.Client

// Auth service URLs (from environment)
var (
	USER_SERVICE_URL = getEnvWithFallback("USER_SERVICE_URL", "http://localhost:3001")
)

func getEnvWithFallback(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

// Initialize Redis client
func InitRedis(redisURL string) error {
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		return fmt.Errorf("failed to parse Redis URL: %v", err)
	}

	redisClient = redis.NewClient(opt)

	// Test connection
	ctx := context.Background()
	_, err = redisClient.Ping(ctx).Result()
	if err != nil {
		return fmt.Errorf("failed to connect to Redis: %v", err)
	}

	fmt.Println("✅ Connected to Redis successfully")
	return nil
}

// GetRedisClient returns the Redis client instance
func GetRedisClient() *redis.Client {
	return redisClient
}
