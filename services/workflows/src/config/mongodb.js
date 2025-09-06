import mongoose from 'mongoose';
import { config } from './config.js';
import { logger } from '../utils/logger.js';

export async function initializeMongoDB() {
  try {
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to initialize MongoDB:', error);
    throw error;
  }
}

export { mongoose };