import db from '../../../shared/database/connection';
import { UserSport } from '../../../shared/types/auth.types';

/**
 * UserSportsRepository
 * Handles database operations for user_sports junction table
 */
export class UserSportsRepository {
  /**
   * Add a sport to a user's profile
   * Handles unique constraint (user_id, sport_name)
   * @param userId - User ID (integer)
   * @param sportData - Sport preferences data
   * @returns Created UserSport or throws on constraint violation
   */
  async addUserSport(
    userId: number,
    sportData: Omit<UserSport, 'id'>
  ): Promise<UserSport> {
    try {
      // Check if user exists and is active
      const user = await db('users')
        .select('id')
        .where({ id: userId, status: 'active' })
        .first();

      if (!user) {
        const error = new Error('User not found or inactive');
        (error as any).code = 'USER_NOT_FOUND';
        throw error;
      }

      // Insert sport preference
      await db('user_sports').insert({
        user_id: userId,
        sport_name: sportData.sport_name,
        skill_level: sportData.skill_level,
        years_experience: sportData.years_experience || null,
        preferred_position: sportData.preferred_position || null,
      });

      // Return the created sport (fetch it back)
      const createdSport = await db('user_sports')
        .select('sport_name', 'skill_level', 'years_experience', 'preferred_position')
        .where({ user_id: userId, sport_name: sportData.sport_name })
        .first();

      return createdSport as UserSport;
    } catch (error: any) {
      // Handle unique constraint violation (duplicate sport)
      // PostgreSQL: 23505, MySQL: ER_DUP_ENTRY, SQLite: SQLITE_CONSTRAINT
      if (
        error.code === '23505' ||
        error.code === 'ER_DUP_ENTRY' ||
        error.code === 'SQLITE_CONSTRAINT'
      ) {
        const duplicateError = new Error(
          `User already has ${sportData.sport_name} in their sports list`
        );
        (duplicateError as any).code = 'DUPLICATE_SPORT';
        throw duplicateError;
      }

      // Re-throw USER_NOT_FOUND errors
      if ((error as any).code === 'USER_NOT_FOUND') {
        throw error;
      }

      // Log unexpected errors
      console.error('Error in UserSportsRepository.addUserSport:', error);
      throw error;
    }
  }

  /**
   * Remove a sport from a user's profile
   * @param userId - User ID (integer)
   * @param sportName - Name of the sport to remove
   * @returns true if deleted, false if sport not found
   */
  async removeUserSport(userId: number, sportName: string): Promise<boolean> {
    try {
      const deletedCount = await db('user_sports')
        .where({
          user_id: userId,
          sport_name: sportName,
        })
        .del();

      return deletedCount > 0;
    } catch (error) {
      console.error('Error in UserSportsRepository.removeUserSport:', error);
      throw error;
    }
  }

  /**
   * Get all sports for a user
   * @param userId - User ID (integer)
   * @returns Array of UserSport objects (empty array if none)
   */
  async getUserSports(userId: number): Promise<UserSport[]> {
    try {
      const sports = await db('user_sports')
        .select('sport_name', 'skill_level', 'years_experience', 'preferred_position')
        .where({ user_id: userId })
        .orderBy('created_at', 'asc');

      return sports as UserSport[];
    } catch (error) {
      console.error('Error in UserSportsRepository.getUserSports:', error);
      return [];
    }
  }
}

// Export singleton instance
export default new UserSportsRepository();
