/**
 * User Search Routes
 * Defines routes for user search functionality
 */

import { Router } from 'express';
import { searchUsers } from '../controllers/user-search.controller';
import { validateRequest } from '../../../shared/middleware/validation.middleware';
import { searchParamsSchema } from '../schemas/user-search.schema';
import { searchRateLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

/**
 * GET /api/users/search
 * Search users with filters, ranking, and pagination
 *
 * Query parameters:
 * - query: Optional text search for username/full_name
 * - location_city: Optional city filter
 * - sport: Optional array of sports (['pickleball', 'paddle'])
 * - skill_level: Optional skill level enum ('beginner', 'intermediate', 'advanced', 'expert')
 * - limit: Pagination limit (default 20, max 100)
 * - offset: Pagination offset (default 0, min 0)
 *
 * Middleware chain:
 * 1. Rate limiter: 100 requests per 15 minutes per IP
 * 2. Query validation: Validates query parameters against searchParamsSchema
 * 3. Controller: Processes request and returns results
 *
 * Response:
 * - 200: Success with results array and pagination metadata
 * - 400: Validation error (invalid parameters)
 * - 429: Rate limit exceeded
 * - 500: Internal server error
 *
 * Headers:
 * - X-Total-Count: Total number of results
 * - Link: Next/previous page links (if applicable)
 * - X-RateLimit-Limit: Maximum requests allowed
 * - X-RateLimit-Remaining: Remaining requests in current window
 * - X-RateLimit-Reset: When the rate limit window resets
 */
router.get(
  '/search',
  searchRateLimiter,
  validateRequest({ query: searchParamsSchema }),
  searchUsers
);

export default router;
