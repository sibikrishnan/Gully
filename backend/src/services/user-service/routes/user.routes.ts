/**
 * User Routes
 * Defines routes for user profile operations
 */

import { Router, Request, Response } from 'express';
import { getUserProfile } from '../controllers/user.controller';
import { requireAuth } from '../../../shared/middleware/auth.middleware';
import { validateRequest } from '../../../shared/middleware/validation.middleware';
import { getUserParamsSchema } from '../schemas/user.schema';
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

export default router;
