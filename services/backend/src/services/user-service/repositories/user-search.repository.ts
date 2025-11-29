import db from '../../../shared/database/connection';
import { User } from '../../../shared/types/auth.types';

/**
 * Search filter parameters for user search
 */
export interface SearchFilters {
  query?: string; // Search username or full_name
  location_city?: string;
  sport?: string[]; // Array of sports (e.g., ['pickleball', 'paddle'])
  skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit: number;
  offset: number;
}

/**
 * UserSearchRepository
 * Handles database operations for user search with filtering and pagination
 */
export class UserSearchRepository {
  /**
   * Execute search query with filters and pagination
   * Excludes soft-deleted users (is_active=false)
   * Supports filtering by username, full_name, location, sport, skill_level
   *
   * @param filters - Search filters (query, location_city, sport, skill_level)
   * @param pagination - Pagination parameters (limit, offset)
   * @returns Array of matching users
   */
  async executeSearchQuery(
    filters: SearchFilters,
    pagination: PaginationParams
  ): Promise<Omit<User, 'password_hash'>[]> {
    try {
      // Build base query
      let query = db('users')
        .select(
          'users.id',
          'users.email',
          'users.username',
          'users.full_name',
          'users.phone_number',
          'users.skill_level',
          'users.location_lat',
          'users.location_lng',
          'users.location_name',
          'users.preferred_radius_km',
          'users.profile_image_url',
          'users.status',
          'users.last_login_at',
          'users.created_at',
          'users.updated_at'
        )
        .where('users.status', 'active'); // Exclude soft-deleted users

      // Apply text search filter (username or full_name)
      if (filters.query) {
        query = query.where(function() {
          this.where('users.username', 'ilike', `%${filters.query}%`)
              .orWhere('users.full_name', 'ilike', `%${filters.query}%`);
        });
      }

      // Apply location filter
      if (filters.location_city) {
        query = query.where('users.location_name', 'ilike', `%${filters.location_city}%`);
      }

      // Apply skill level filter
      if (filters.skill_level) {
        query = query.where('users.skill_level', filters.skill_level);
      }

      // Apply sport filter with JOIN
      if (filters.sport && filters.sport.length > 0) {
        query = query
          .join('user_sports', 'users.id', 'user_sports.user_id')
          .whereIn('user_sports.sport_name', filters.sport)
          .groupBy(
            'users.id',
            'users.email',
            'users.username',
            'users.full_name',
            'users.phone_number',
            'users.skill_level',
            'users.location_lat',
            'users.location_lng',
            'users.location_name',
            'users.preferred_radius_km',
            'users.profile_image_url',
            'users.status',
            'users.last_login_at',
            'users.created_at',
            'users.updated_at'
          ); // Prevent duplicates from JOIN
      }

      // Apply pagination
      query = query
        .limit(pagination.limit)
        .offset(pagination.offset)
        .orderBy('users.created_at', 'desc'); // Default ordering

      const results = await query;
      return results;
    } catch (error) {
      console.error('Error in UserSearchRepository.executeSearchQuery:', error);
      throw error;
    }
  }

  /**
   * Count total results matching filters (for pagination metadata)
   *
   * @param filters - Search filters
   * @returns Total count of matching users
   */
  async countTotalResults(filters: SearchFilters): Promise<number> {
    try {
      // Build count query (mirrors executeSearchQuery logic)
      let query = db('users')
        .where('users.status', 'active');

      // Apply text search filter
      if (filters.query) {
        query = query.where(function() {
          this.where('users.username', 'ilike', `%${filters.query}%`)
              .orWhere('users.full_name', 'ilike', `%${filters.query}%`);
        });
      }

      // Apply location filter
      if (filters.location_city) {
        query = query.where('users.location_name', 'ilike', `%${filters.location_city}%`);
      }

      // Apply skill level filter
      if (filters.skill_level) {
        query = query.where('users.skill_level', filters.skill_level);
      }

      // Apply sport filter with JOIN
      if (filters.sport && filters.sport.length > 0) {
        query = query
          .join('user_sports', 'users.id', 'user_sports.user_id')
          .whereIn('user_sports.sport_name', filters.sport)
          .countDistinct('users.id as count'); // Use DISTINCT to avoid duplicates from JOIN

        const result = await query.first();
        return parseInt(result?.count as string || '0', 10);
      }

      // Count without JOIN
      const result = await query.count('users.id as count').first();
      return parseInt(result?.count as string || '0', 10);
    } catch (error) {
      console.error('Error in UserSearchRepository.countTotalResults:', error);
      throw error;
    }
  }
}
