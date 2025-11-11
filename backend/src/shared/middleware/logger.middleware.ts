/**
 * Logger Middleware
 * Request/response logging with morgan
 */

import morgan from 'morgan';
import { Request, Response } from 'express';

/**
 * Custom morgan token for response time in milliseconds
 */
morgan.token('response-time-ms', (_req: Request, res: Response) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '-';
});

/**
 * Custom morgan format
 * Logs: method, path, status, duration
 */
const logFormat = ':method :url :status :response-time ms';

/**
 * Morgan middleware configuration
 * Uses 'dev' format in development, custom format in production
 */
export const requestLogger = process.env.NODE_ENV === 'development'
  ? morgan('dev') // Colored output for development
  : morgan(logFormat); // Simple format for production

/**
 * Skip logging for health check endpoint (optional)
 * Reduces noise in logs
 */
export const requestLoggerWithSkip = morgan(logFormat, {
  skip: (req: Request, _res: Response) => {
    // Skip logging health checks in production
    if (process.env.NODE_ENV === 'production' && req.path === '/health') {
      return true;
    }
    return false;
  },
});
