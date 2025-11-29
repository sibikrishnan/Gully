/**
 * User Controller
 * Handles user profile retrieval and updates with field-level access control
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../../../shared/types/auth.types';
import { UserRepository } from '../repositories/user.repository';
import { stripNonUpdatableFields, updateUserSchema } from '../schemas/user.schema';
import { UserCascadeService } from '../services/user-cascade.service';
import { UserCleanupService } from '../services/user-cleanup.service';

const userRepository = new UserRepository();
const cascadeService = new UserCascadeService();
const cleanupService = new UserCleanupService();

/**
 * Retrieve a user profile with field-level access control.
 *
 * Own profile requests return all user fields including `email` and `phone_number`.
 * Requests for another user's profile omit `email` and `phone_number`.
 * The `password_hash` field is never returned (handled by the repository).
 *
 * Responds with:
 * - 200 and the user profile on success
 * - 404 if the user is not found
 * - 500 for unexpected server errors
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

/**
 * Update the authenticated user's profile with sanitized and validated fields.
 *
 * Strips non-updatable fields (e.g., id, email, password_hash, timestamps), validates the remaining partial payload, and applies the update only when the requester is the target user. Responds with 200 and the updated user on success; 403 if the requester is not the user; 400 for validation errors or invalid enum values; 409 if the username already exists; 404 if the user does not exist; and 500 for other server errors.
 */
export async function updateUserProfile(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = parseInt(req.params.id, 10);

    // Authorization check: users can only update their own profile
    if (!req.user || req.user.id !== userId) {
      res.status(403).json({ error: 'Forbidden: You can only update your own profile' });
      return;
    }

    // Strip non-updatable fields from request body
    const sanitizedData = stripNonUpdatableFields(req.body);

    // Validate with Zod partial schema
    const validationResult = updateUserSchema.safeParse(sanitizedData);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues
      });
      return;
    }

    const updates = validationResult.data;

    // Handle empty update payload (no-op)
    if (Object.keys(updates).length === 0) {
      // Return current user data
      const currentUser = await userRepository.findById(userId);
      if (!currentUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.status(200).json(currentUser);
      return;
    }

    // Perform update via repository
    const updatedUser = await userRepository.updateUser(userId, updates);

    // User not found
    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Success
    res.status(200).json(updatedUser);
  } catch (error: any) {
    // Handle known validation errors
    if (error.message === 'Username already exists') {
      res.status(409).json({ error: 'Username already exists' });
      return;
    }

    if (error.message?.includes('Invalid status value') ||
        error.message?.includes('Invalid skill_level value')) {
      res.status(400).json({ error: error.message });
      return;
    }

    console.error('Error in updateUserProfile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete the authenticated user's profile and orchestrate related cleanup.
 *
 * Performs an ownership check, then runs cascade operations for related data,
 * purges sessions/tokens/cache, and performs a soft delete of the user record.
 * Sends 204 No Content on success and appropriate HTTP error responses for
 * unauthorized access, not-found, or deletion failures.
 */
export async function deleteUserProfile(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = parseInt(req.params.id, 10);

    // Authorization check: users can only delete their own profile
    if (!req.user || req.user.id !== userId) {
      res.status(403).json({ error: 'Forbidden: You can only delete your own profile' });
      return;
    }

    // Check if user exists and is active (not already deleted)
    const user = await userRepository.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Orchestrate deletion flow: cascade → cleanup → soft delete
    // Step 1: Handle cascade effects (team removal, captain transfer, etc.)
    await cascadeService.handleUserDeletionCascade(userId);

    // Step 2: Cleanup sessions, tokens, cache
    await cleanupService.cleanupUserSessions(userId);

    // Step 3: Soft delete the user
    const deleted = await userRepository.softDeleteUser(userId);

    if (!deleted) {
      res.status(500).json({ error: 'Failed to delete user' });
      return;
    }

    // Success: return 204 No Content
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteUserProfile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}