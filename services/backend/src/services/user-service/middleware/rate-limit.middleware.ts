/**
 * Rate Limit Middleware
 * Implements simple in-memory rate limiting per IP address
 *
 * For production, this should be replaced with Redis-backed rate limiting
 * to support distributed systems and persistence across restarts.
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory store for rate limit tracking
 * Key: IP address
 * Value: { count, resetTime }
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Cleanup expired entries every 5 minutes to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * Creates an Express middleware that enforces a per-client-IP rate limit.
 *
 * @param maxRequests - Maximum requests allowed within the time window
 * @param windowMs - Time window in milliseconds
 * @returns An Express middleware that sets `X-RateLimit-*` headers and returns HTTP 429 with `Retry-After` when the limit is exceeded
 */
export function createRateLimiter(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Get client IP (handle proxies with X-Forwarded-For)
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || req.socket.remoteAddress
      || 'unknown';

    const now = Date.now();
    const entry = rateLimitStore.get(clientIp);

    // Initialize or reset if window expired
    if (!entry || entry.resetTime < now) {
      rateLimitStore.set(clientIp, {
        count: 1,
        resetTime: now + windowMs
      });

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', (maxRequests - 1).toString());
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

      next();
      return;
    }

    // Increment counter
    entry.count++;

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());
      res.setHeader('Retry-After', Math.ceil((entry.resetTime - now) / 1000).toString());

      res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil((entry.resetTime - now) / 1000)} seconds.`
      });
      return;
    }

    // Update headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (maxRequests - entry.count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());

    next();
  };
}

/**
 * Pre-configured rate limiter for search endpoints
 * 100 requests per 15 minutes per IP
 */
export const searchRateLimiter = createRateLimiter(100, 15 * 60 * 1000);