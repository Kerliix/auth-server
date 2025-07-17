import mongoose from 'mongoose';
import logger from './logger.js';

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI;
    if (!dbURI) {
      logger.error('MONGO_URI is not defined in the .env');
      process.exit(1);
    }
    
    await mongoose.connect(dbURI, {
    });

    logger.info('MongoDB Connected...');
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
