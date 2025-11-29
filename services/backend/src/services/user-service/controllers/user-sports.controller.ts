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
 * Add a sport to the authenticated user's profile.
 *
 * Validates the request body and ensures the requester matches the `:id` URL parameter.
 * Responds with 201 and the created sport on success.
 *
 * Error responses:
 * - 400: Validation failed (invalid payload)
 * - 403: Forbidden (requester does not match `:id`)
 * - 404: User not found
 * - 409: Duplicate sport (sport already exists for user)
 * - 500: Internal server error
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
 * Removes a sport from the specified user's profile.
 *
 * Responds with 204 No Content on successful deletion. Returns 403 if the authenticated user
 * is not the target user, 404 if the user or sport is not found, and 500 for internal server errors.
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