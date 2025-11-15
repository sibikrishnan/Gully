/**
 * User Routes
 * Defines routes for user profile operations
 */

import { Router, Request, Response } from 'express';
import { getUserProfile, updateUserProfile, deleteUserProfile } from '../controllers/user.controller';
import { requireAuth } from '../../../shared/middleware/auth.middleware';
import { validateRequest } from '../../../shared/middleware/validation.middleware';
import { getUserParamsSchema, updateUserSchema } from '../schemas/user.schema';
import { AuthenticatedRequest } from '../../../shared/types/auth.types';

const router = Router();

/**
 * GET /api/users/:id
 * Retrieve user profile with field-level access control
 * - Requires authentication
 * - Validates ID parameter (positive integer)
 * - Returns own profile with all fields or other profile with limited fields
 */
router.get(
  '/:id',
  requireAuth,
  validateRequest({ params: getUserParamsSchema }),
  (req: Request, res: Response) => getUserProfile(req as AuthenticatedRequest, res)
);

/**
 * PATCH /api/users/:id
 * Update user profile with authorization and validation
 * - Requires authentication (JWT token)
 * - Validates ID parameter (positive integer)
 * - Validates request body (partial user update schema)
 * - Only allows users to update their own profile
 * - Strips non-updatable fields (id, password_hash, email, created_at, updated_at)
 * - Returns 200 with updated user on success
 */
router.patch(
  '/:id',
  requireAuth,
  validateRequest({ params: getUserParamsSchema }),
  validateRequest({ body: updateUserSchema }),
  (req: Request, res: Response) => updateUserProfile(req as AuthenticatedRequest, res)
);

/**
 * DELETE /api/users/:id
 * Delete user profile with authorization and orchestration
 * - Requires authentication (JWT token)
 * - Validates ID parameter (positive integer)
 * - Only allows users to delete their own profile (403 for others)
 * - Orchestrates: cascade → cleanup → soft delete
 * - Returns 204 No Content on successful deletion
 * - Returns 404 if user not found
 * - Returns 403 if unauthorized
 */
router.delete(
  '/:id',
  requireAuth,
  validateRequest({ params: getUserParamsSchema }),
  (req: Request, res: Response) => deleteUserProfile(req as AuthenticatedRequest, res)
);

export default router;
