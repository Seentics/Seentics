// services/CacheService.js - Helper service for cache invalidation
import axios from 'axios';

const gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:8080';

// Invalidate user cache
export const invalidateUserCache = async (userId) => {
  try {
    // If you have a direct Redis connection in your user service:
    // await clearUserCacheInRedis(userId);
    
    // Or call gateway cache invalidation endpoint:
    // await axios.post(`${gatewayUrl}/internal/cache/clear-user/${userId}`);
    
    return true;
  } catch (error) {
    return false;
  }
};

// Invalidate website cache
export const invalidateWebsiteCache = async (websiteId) => {
  try {
    // If you have a direct Redis connection in your user service:
    // await clearWebsiteCacheInRedis(websiteId);
    
    // Or call gateway cache invalidation endpoint:
    // await axios.post(`${gatewayUrl}/internal/cache/clear-website/${websiteId}`);
    
    return true;
  } catch (error) {
    return false;
  }
};

// Invalidate token cache
export const invalidateTokenCache = async (token) => {
  try {
    // If you have a direct Redis connection in your user service:
    // await clearTokenCacheInRedis(token);
    
    // Or call gateway cache invalidation endpoint:
    // await axios.post(`${gatewayUrl}/internal/cache/clear-token`, { token });
    
    return true;
  } catch (error) {
    return false;
  }
};

// Redis cache clearing methods (implement based on your Redis setup)
export const clearUserCacheInRedis = async (userId) => {
  // Example implementation:
  // const redis = getRedisClient();
  // const pattern = `user:${userId}:*`;
  // const keys = await redis.keys(pattern);
  // if (keys.length > 0) {
  //   await redis.del(keys);
  // }
};

export const clearWebsiteCacheInRedis = async (websiteId) => {
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
};

export const clearTokenCacheInRedis = async (token) => {
  // Example implementation:
  // const redis = getRedisClient();
  // const key = `token:${token}`;
  // await redis.del(key);
};

const cacheService = {
  invalidateUserCache,
  invalidateWebsiteCache,
  invalidateTokenCache,
  clearUserCacheInRedis,
  clearWebsiteCacheInRedis,
  clearTokenCacheInRedis
};

export default cacheService;