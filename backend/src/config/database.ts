import mongoose from 'mongoose';
import { logger } from '../utils/logger';

// Increase max listeners for EventEmitter
process.setMaxListeners(15);

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_TEST_URI 
      : process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    const options: mongoose.ConnectOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: true,
      connectTimeoutMS: 30000,
    };

    // Remove any existing listeners to prevent duplicates
    mongoose.connection.removeAllListeners();

    await mongoose.connect(mongoUri, options);
    
    logger.info('Connected to MongoDB successfully');

    // Handle connection events
    const handleError = (error: Error) => {
      logger.error('MongoDB connection error:', error);
    };

    const handleDisconnect = () => {
      logger.warn('MongoDB disconnected');
    };

    const handleReconnect = () => {
      logger.info('MongoDB reconnected');
    };

    // Add single instance of each listener
    mongoose.connection.once('error', handleError);
    mongoose.connection.once('disconnected', handleDisconnect);
    mongoose.connection.once('reconnected', handleReconnect);

  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};