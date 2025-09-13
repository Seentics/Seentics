import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3003,
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://mongodb:27017/seentics-workflows',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB || 0
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY || '',
    fromAddress: process.env.RESEND_FROM || 'no-reply@yourdomain.com'
  },
  webhooks: {
    hmacSecret: process.env.WEBHOOK_HMAC_SECRET || ''
  },
  
  analytics: {
    batchSize: parseInt(process.env.ANALYTICS_BATCH_SIZE) || 100,
    flushInterval: parseInt(process.env.ANALYTICS_FLUSH_INTERVAL) || 5000
  }
};