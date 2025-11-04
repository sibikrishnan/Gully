/**
 * Auth Routes
 * Authentication endpoints for user signup, login, refresh, and me
 */

import { Router } from 'express';
import { signup, login, refresh, me } from '../controllers/auth.controller';
import { requireAuth } from '../../../shared/middleware/auth.middleware';

const router = Router();

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/signup', signup);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', login);

/**
 * POST /api/auth/refresh
 * Generate new access token using refresh token
 */
router.post('/refresh', refresh);

/**
 * GET /api/auth/me
 * Get current authenticated user data
 * Protected route - requires valid access token
 */
router.get('/me', requireAuth, me);

export default router;
