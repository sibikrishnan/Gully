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

/**
 * PATCH /api/users/:id - Update user profile
 * Implements authorization and field-level security:
 * - Only allows users to update their own profile (403 for others)
 * - Strips non-updatable fields (id, email, password_hash, created_at, updated_at)
 * - Validates partial updates with Zod schema
 * - Returns 200 with updated user on success
 * - Returns 404 if user not found
 * - Returns 403 if unauthorized
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
 * DELETE /api/users/:id - Delete user profile
 * Implements authorization and deletion orchestration:
 * - Only allows users to delete their own profile (403 for others)
 * - Orchestrates: cascade → cleanup → soft delete
 * - Returns 204 No Content on successful deletion
 * - Returns 404 if user not found or already deleted
 * - Returns 403 if unauthorized
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
