/**
 * User Controller
 * Handles user profile retrieval with field-level access control
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../../../shared/types/auth.types';
import { UserRepository } from '../repositories/user.repository';

const userRepository = new UserRepository();

/**
 * GET /api/users/:id - Retrieve user profile
 * Implements field-level access control:
 * - Own profile (req.user.id === userId): Returns all fields including email, phone_number
 * - Other profile (req.user.id !== userId): Excludes email, phone_number
 * - Always excludes password_hash (handled by repository)
 */
export async function getUserProfile(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = parseInt(req.params.id, 10);

    // Fetch user from repository
    const user = await userRepository.getUserWithSports(userId);

    // User not found or inactive
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Field-level access control
    const isOwnProfile = req.user && req.user.id === userId;

    if (isOwnProfile) {
      // Own profile: return all fields (email, phone_number included)
      res.status(200).json(user);
    } else {
      // Other profile: exclude email and phone_number
      const { email, phone_number, ...publicProfile } = user;
      res.status(200).json(publicProfile);
    }
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
