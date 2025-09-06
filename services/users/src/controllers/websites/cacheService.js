// services/CacheService.js - Helper service for cache invalidation
import axios from 'axios';

class CacheService {
  constructor() {
    this.gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:8080';
  }

  // Invalidate user cache
  async invalidateUserCache(userId) {
    try {
      // If you have a direct Redis connection in your user service:
      // await this.clearUserCacheInRedis(userId);
      
      // Or call gateway cache invalidation endpoint:
      // await axios.post(`${this.gatewayUrl}/internal/cache/clear-user/${userId}`);
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // Invalidate website cache
  async invalidateWebsiteCache(websiteId) {
    try {
      // If you have a direct Redis connection in your user service:
      // await this.clearWebsiteCacheInRedis(websiteId);
      
      // Or call gateway cache invalidation endpoint:
      // await axios.post(`${this.gatewayUrl}/internal/cache/clear-website/${websiteId}`);
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // Invalidate token cache
  async invalidateTokenCache(token) {
    try {
      // If you have a direct Redis connection in your user service:
      // await this.clearTokenCacheInRedis(token);
      
      // Or call gateway cache invalidation endpoint:
      // await axios.post(`${this.gatewayUrl}/internal/cache/clear-token`, { token });
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // Redis cache clearing methods (implement based on your Redis setup)
  async clearUserCacheInRedis(userId) {
    // Example implementation:
    // const redis = getRedisClient();
    // const pattern = `user:${userId}:*`;
    // const keys = await redis.keys(pattern);
    // if (keys.length > 0) {
    //   await redis.del(keys);
    // }
  }

  async clearWebsiteCacheInRedis(websiteId) {
    // Example implementation:
    // const redis = getRedisClient();
    // const patterns = [
    //   `website:${websiteId}:*`,
    //   `domain:*:${websiteId}`,
    //   `siteId:*:${websiteId}`
    // ];
    // 
    // for (const pattern of patterns) {
    //   const keys = await redis.keys(pattern);
    //   if (keys.length > 0) {
    //     await redis.del(keys);
    //   }
    // }
  }

  async clearTokenCacheInRedis(token) {
    // Example implementation:
    // const redis = getRedisClient();
    // const key = `token:${token}`;
    // await redis.del(key);
  }
}

export default new CacheService();