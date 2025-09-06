package utils

import (
	"context"
	"time"

	"github.com/go-redis/redis/v8"
)

// Check rate limit using Redis INCR
func CheckRateLimit(redisClient *redis.Client, key string, limit int, window time.Duration) (bool, int, error) {
	ctx := context.Background()

	// Use Redis INCR for atomic increment
	count, err := redisClient.Incr(ctx, key).Result()
	if err != nil {
		return false, 0, err
	}

	// Set expiration on first request
	if count == 1 {
		redisClient.Expire(ctx, key, window)
	}

	return count <= int64(limit), int(count), nil
}
