import db from '../../../shared/database/connection';
import { User, UserWithSports, UserSport } from '../../../shared/types/auth.types';

/**
 * UserRepository
 * Handles database operations for users
 */
export class UserRepository {
  /**
   * Find user by ID (excluding password_hash)
   * Only returns active users
   * @param id - User ID (integer)
   * @returns User without password_hash or null if not found/inactive
   */
  async findById(id: number): Promise<Omit<User, 'password_hash'> | null> {
    try {
      // Validate ID
      if (!id || id <= 0) {
        return null;
      }

      const user = await db('users')
        .select(
          'id',
          'email',
          'username',
          'full_name',
          'phone_number',
          'skill_level',
          'location_lat',
          'location_lng',
          'location_name',
          'preferred_radius_km',
          'profile_image_url',
          'status',
          'last_login_at',
          'created_at',
          'updated_at'
        )
        .where({ id, status: 'active' })
        .first();

      return user || null;
    } catch (error) {
      console.error('Error in UserRepository.findById:', error);
      return null;
    }
  }

  /**
   * Get user with associated sports (LEFT JOIN)
   * Only returns active users
   * @param id - User ID (integer)
   * @returns User with sports array or null if not found/inactive
   */
  async getUserWithSports(id: number): Promise<UserWithSports | null> {
    try {
      // Validate ID
      if (!id || id <= 0) {
        return null;
      }

      // Get user data
      const user = await this.findById(id);
      if (!user) {
        return null;
      }

      // Get sports data with LEFT JOIN
      const sportsData = await db('user_sports')
        .select(
          'sport_name',
          'skill_level',
          'years_experience',
          'preferred_position'
        )
        .where({ user_id: id })
        .orderBy('created_at', 'asc');

      // Combine user and sports data
      const userWithSports: UserWithSports = {
        ...user,
        sports: sportsData.map((sport): UserSport => ({
          sport_name: sport.sport_name,
          skill_level: sport.skill_level,
          years_experience: sport.years_experience || undefined,
          preferred_position: sport.preferred_position || undefined,
        })),
      };

      return userWithSports;
    } catch (error) {
      console.error('Error in UserRepository.getUserWithSports:', error);
      return null;
    }
  }

  /**
   * Update user profile (PATCH operation - partial updates)
   * Only allows updating mutable fields, excludes id, password_hash, created_at
   * Enforces unique constraints on username
   * Uses transaction for atomic updates
   * @param id - User ID (integer)
   * @param updates - Partial user data to update
   * @returns Updated user without password_hash or null if not found/failed
   */
  async updateUser(
    id: number,
    updates: Partial<Omit<User, 'id' | 'password_hash' | 'created_at'>>
  ): Promise<Omit<User, 'password_hash'> | null> {
    // Validate ID
    if (!id || id <= 0) {
      return null;
    }

    // Validate updates object is not empty
    if (!updates || Object.keys(updates).length === 0) {
      return null;
    }

    // Remove immutable fields if accidentally included
    const sanitizedUpdates = { ...updates };
    delete (sanitizedUpdates as any).id;
    delete (sanitizedUpdates as any).password_hash;
    delete (sanitizedUpdates as any).created_at;
    delete (sanitizedUpdates as any).updated_at; // Managed by database trigger

    // Validate status field if provided
    if (sanitizedUpdates.status) {
      const validStatuses = ['active', 'inactive', 'suspended'];
      if (!validStatuses.includes(sanitizedUpdates.status)) {
        throw new Error(`Invalid status value. Must be one of: ${validStatuses.join(', ')}`);
      }
    }

    // Validate skill_level field if provided
    if (sanitizedUpdates.skill_level) {
      const validSkillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
      if (!validSkillLevels.includes(sanitizedUpdates.skill_level)) {
        throw new Error(`Invalid skill_level value. Must be one of: ${validSkillLevels.join(', ')}`);
      }
    }

    try {
      // Use transaction for atomic update
      const result = await db.transaction(async (trx) => {
        // Check if user exists
        const existingUser = await trx('users')
          .select('id')
          .where({ id })
          .first();

        if (!existingUser) {
          return null;
        }

        // Check for unique username constraint if username is being updated
        if (sanitizedUpdates.username) {
          const usernameConflict = await trx('users')
            .select('id')
            .where({ username: sanitizedUpdates.username })
            .whereNot({ id })
            .first();

          if (usernameConflict) {
            throw new Error('Username already exists');
          }
        }

        // Perform the update
        const updateCount = await trx('users')
          .update(sanitizedUpdates)
          .where({ id });

        // If no rows updated, user doesn't exist (shouldn't happen due to check above)
        if (updateCount === 0) {
          return null;
        }

        // Fetch and return updated user (excluding password_hash)
        const updatedUser = await trx('users')
          .select(
            'id',
            'email',
            'username',
            'full_name',
            'phone_number',
            'skill_level',
            'location_lat',
            'location_lng',
            'location_name',
            'preferred_radius_km',
            'profile_image_url',
            'status',
            'last_login_at',
            'created_at',
            'updated_at'
          )
          .where({ id })
          .first();

        return updatedUser || null;
      });

      return result;
    } catch (error: any) {
      // Handle unique constraint violations
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new Error('Username already exists');
      }

      // Re-throw known errors
      if (error.message === 'Username already exists' ||
          error.message?.includes('Invalid status value') ||
          error.message?.includes('Invalid skill_level value')) {
        throw error;
      }

      // Log unexpected errors
      console.error('Error in UserRepository.updateUser:', error);
      return null;
    }
  }
}
