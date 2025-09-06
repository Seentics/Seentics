import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/config.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import { apiKeyMiddleware } from './middleware/apiKeyMiddleware.js';
import { initializeMongoDB } from './config/mongodb.js';
import { initializeRedis } from './config/redis.js';
import { initializeQueues } from './services/queueService.js';


// Route imports
import workflowRoutes from './routes/workflowRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import visitorRoutes from './routes/visitorRoutes.js';
import healthRoutes from './routes/healthRoutes.js';


const app = express();

// Security middleware
app.use(helmet());

// Disable ETags to prevent 304 responses
app.set('etag', false);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Health check route (no auth required)
app.use('/health', healthRoutes);

// API Key validation for all routes (except health check)
app.use((req, res, next) => {
  // Skip API key validation for health check
  if (req.path === '/health') {
    next();
    return;
  }
  // Apply API key middleware to all other routes
  apiKeyMiddleware(req, res, next);
});

// Auth middleware for protected routes
app.use('/api', authMiddleware);

// API routes
app.use('/api/v1/workflows', workflowRoutes);
app.use('/api/v1/workflows/analytics', analyticsRoutes);
app.use('/api/v1/visitor', visitorRoutes);


// Error handling middleware
app.use(errorHandler);

// Initialize services
async function initializeServices() {
  try {
    await initializeMongoDB();
    await initializeRedis();
    await initializeQueues();

    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  await initializeServices();
  
  const PORT = config.port || 3003;
  app.listen(PORT, () => {
    logger.info(`Workflows Service running on port ${PORT}`);
    logger.info(`Environment: ${config.env}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer().catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default app;