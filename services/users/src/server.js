import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { connectDB } from './db/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { apiKeyMiddleware } from './middleware/apiKey.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import websiteRoutes from './routes/websites.js';
import privacyRoutes from './routes/privacy.js';
import validationRoutes from './routes/validation.js';
import { config } from './config/config.js';

const app = express();

app.set('trust proxy', 1);

// Connect to database
connectDB();

// Security middleware
app.use(helmet());



// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'user-service'
  });
});

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

// API routes
app.use('/api/v1/user/auth', authRoutes);
app.use('/api/v1/user/users', userRoutes);
app.use('/api/v1/user/websites', websiteRoutes);
app.use('/api/v1/user/privacy', privacyRoutes);
app.use('/api/v1/user/validation', validationRoutes);

// Internal API routes for microservice communication
app.use('/api/internal', userRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = config.PORT || 3001;

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});

export default app;