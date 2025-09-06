import express from 'express';
import { mongoose } from '../config/mongodb.js';
import { redisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {}
    };

    // Check MongoDB connection
    try {
      await mongoose.connection.db.admin().ping();
      health.services.mongodb = 'healthy';
    } catch (error) {
      health.services.mongodb = 'unhealthy';
      health.status = 'unhealthy';
    }

    // Check Redis connection
    try {
      await redisClient.ping();
      health.services.redis = 'healthy';
    } catch (error) {
      health.services.redis = 'unhealthy';
      health.status = 'unhealthy';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

export default router;