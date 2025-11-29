/**
 * Express Application Setup
 * Main app configuration with middleware, routes, and error handling
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import dotenv from 'dotenv';
import { checkDatabaseConnection } from './shared/database/connection';
import { requestLogger } from './shared/middleware/logger.middleware';
import { errorHandler, notFoundHandler } from './shared/middleware/error.middleware';
import { configurePassport } from './shared/config/passport.config';

// Import service routes
import userRoutes from './services/user-service/routes/user.routes';
// TODO: Uncomment when auth routes are re-implemented
// import authRoutes from './services/user-service/routes/auth.routes';

// Load environment variables
dotenv.config();

/**
 * Create and configure an Express application with security, CORS, body parsing, logging,
 * authentication initialization, health check, service routes, and error handlers.
 *
 * @returns The configured Express application instance
 */
export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'];
  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    })
  );

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use(requestLogger);

  // Initialize Passport
  configurePassport();
  app.use(passport.initialize());

  // Health check endpoint
  app.get('/health', async (_req: Request, res: Response) => {
    try {
      // Check database connection
      const dbConnected = await checkDatabaseConnection();

      // Check Redis connection (if configured)
      let redisStatus = {
        connected: false,
        available: false,
      };

      // TODO: Add Redis connection check when Redis is implemented
      // For now, Redis is not available
      redisStatus.available = false;

      // Overall health status
      const isHealthy = dbConnected;

      res.status(isHealthy ? 200 : 503).json({
        success: true,
        data: {
          status: isHealthy ? 'ok' : 'degraded',
          timestamp: new Date().toISOString(),
          database: {
            connected: dbConnected,
          },
          redis: redisStatus,
        },
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: {
          message: 'Health check failed',
          statusCode: 503,
        },
      });
    }
  });

  // Mount service routes
  app.use('/api/users', userRoutes);
  // TODO: Uncomment when auth routes are re-implemented
  // app.use('/api/auth', authRoutes);

  // 404 handler for unknown routes (must be after all other routes)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}

// Export configured app
const app = createApp();
export default app;