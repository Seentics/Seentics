import mongoose from 'mongoose';
import { config } from '../config/config.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI, {
      // Performance optimizations
      maxPoolSize: 10,           // Limit connection pool
      serverSelectionTimeoutMS: 5000,  // 5 second timeout
      socketTimeoutMS: 45000,    // 45 second socket timeout
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Handle database connection events
mongoose.connection.on('disconnected', () => {
  console.log('📦 MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});