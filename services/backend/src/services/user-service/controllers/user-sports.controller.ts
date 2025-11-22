/**
 * User Sports Controller
 * Handles POST/DELETE /api/users/:id/sports endpoints
 * Implements authorization checks (users can only manage their own sports)
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../../../shared/types/auth.types';
import { UserSportsRepository } from '../repositories/user-sports.repository';
import { UserRepository } from '../repositories/user.repository';
import { addSportSchema } from '../schemas/user-sports.schema';

const userSportsRepository = new UserSportsRepository();
const userRepository = new UserRepository();

/**
 * POST /api/users/:id/sports - Add a sport to user's profile
 * Authorization: Users can only add sports to their own profile
 * Returns: 201 with created sport object
 * Errors:
 * - 400: Validation failed (invalid sport_name or skill_level)
 * - 403: Forbidden (trying to add sport to another user's profile)
 * - 404: User not found or inactive
 * - 409: Duplicate sport (user already has this sport)
 */
export async function addUserSport(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = parseInt(req.params.id, 10);

    // Authorization check: users can only add sports to their own profile
    if (!req.user || req.user.id !== userId) {
      res.status(403).json({ error: 'Forbidden: You can only manage your own sports' });
      return;
    }

    // Validate payload with Zod schema
    const validationResult = addSportSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues,
      });
      return;
    }

    const sportData = validationResult.data;

    // Add sport via repository
    const createdSport = await userSportsRepository.addUserSport(userId, sportData);

    // Success: return 201 with created sport
    res.status(201).json(createdSport);
  } catch (error: any) {
    // Handle duplicate sport error
    if (error.code === 'DUPLICATE_SPORT') {
      res.status(409).json({ error: error.message });
      return;
    }

    // Handle user not found error
    if (error.code === 'USER_NOT_FOUND') {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    console.error('Error in addUserSport:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * DELETE /api/users/:id/sports/:sport - Remove a sport from user's profile
 * Authorization: Users can only remove sports from their own profile
 * Returns: 204 No Content on successful deletion
 * Errors:
 * - 403: Forbidden (trying to remove sport from another user's profile)
 * - 404: User not found OR sport not found
 */
export async function removeUserSport(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = parseInt(req.params.id, 10);

    // Authorization check: users can only remove sports from their own profile
    if (!req.user || req.user.id !== userId) {
      res.status(403).json({ error: 'Forbidden: You can only manage your own sports' });
      return;
    }

    // Extract sport name from URL parameter (URL-decode if needed)
    const sportName = decodeURIComponent(req.params.sport);

    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Remove sport via repository
    const deleted = await userSportsRepository.removeUserSport(userId, sportName);

    if (!deleted) {
      // Sport not found - return 404
      res.status(404).json({ error: 'Sport not found' });
      return;
    }

    // Success: return 204 No Content
    res.status(204).send();
  } catch (error) {
    console.error('Error in removeUserSport:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
