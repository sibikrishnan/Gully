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
}
