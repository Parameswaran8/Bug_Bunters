import express, { Express } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import formSchemaRoutes from './routes/formSchema';
import bugRoutes from './routes/bug';
import { errorHandler } from './utils/errorHandler';
import { logger } from './utils/logger';
import toolRoutes from './routes/tools';
import teamRoutes from './routes/team';

dotenv.config();

// Create Express application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection Options
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Param_eswaran:Param%402004@cluster0.as4he.mongodb.net/bugs', mongooseOptions)
  .then(() => {
    logger.info('MongoDB connection established successfully');
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', { error: error.message, stack: error.stack });
    process.exit(1);
  });

// Handle MongoDB connection events
mongoose.connection.on('error', (error) => {
  logger.error('MongoDB connection error:', { error: error.message, stack: error.stack });
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/form-schemas', formSchemaRoutes);
app.use('/api/bugs', bugRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/team', teamRoutes);

// Catch-all route for undefined routes
app.use('*', (_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error logging middleware
app.use((err: any, req: express.Request, _res: express.Response, next: express.NextFunction) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body
  });
  next(err);
});

// Final error handler
app.use(errorHandler);

// Ensure we're exporting the Express application directly
module.exports = app;
Object.defineProperty(module.exports, '__esModule', { value: true });