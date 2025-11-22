import { User } from '../../../shared/types/auth.types';
import {
  UserSearchRepository,
  SearchFilters,
  PaginationParams
} from '../repositories/user-search.repository';
import { UserRankingService } from './user-ranking.service';
import { PaginationService, PaginatedResponse } from './pagination.service';

/**
 * Query object with SQL-safe parameters
 */
export interface QueryObject {
  filters: SearchFilters;
  pagination: PaginationParams;
}

/**
 * UserSearchService
 * Orchestrates user search with filtering, ranking, and pagination
 */
export class UserSearchService {
  private repository: UserSearchRepository;
  private rankingService: UserRankingService;
  private paginationService: PaginationService;

  constructor() {
    this.repository = new UserSearchRepository();
    this.rankingService = new UserRankingService();
    this.paginationService = new PaginationService();
  }

  /**
   * Build WHERE clause parameters from filters
   * Ensures all filter values are safely parameterized
   *
   * @param filters - Search filters
   * @returns Validated filter object with SQL-safe parameters
   */
  buildWhereClause(filters: SearchFilters): SearchFilters {
    const safeFilters: SearchFilters = {};

    // Validate and sanitize text search query
    if (filters.query !== undefined && filters.query !== null) {
      const queryStr = String(filters.query).trim();
      if (queryStr.length > 0) {
        safeFilters.query = queryStr;
      }
    }

    // Validate location_city
    if (filters.location_city !== undefined && filters.location_city !== null) {
      const locationStr = String(filters.location_city).trim();
      if (locationStr.length > 0) {
        safeFilters.location_city = locationStr;
      }
    }

    // Validate skill_level enum
    if (filters.skill_level) {
      const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
      if (validLevels.includes(filters.skill_level)) {
        safeFilters.skill_level = filters.skill_level;
      }
    }

    // Validate sport array
    if (filters.sport && Array.isArray(filters.sport) && filters.sport.length > 0) {
      const validSports = ['pickleball', 'paddle'];
      const safeSports = filters.sport.filter(s => validSports.includes(s));
      if (safeSports.length > 0) {
        safeFilters.sport = safeSports;
      }
    }

    return safeFilters;
  }

  /**
   * Add JOIN clauses based on filters
   * Returns a description of JOINs needed (repository handles actual JOIN logic with parameterization)
   * This method is for descriptive purposes only - actual query building uses Knex query builder
   *
   * @param filters - Search filters
   * @returns Description of required JOINs (safe - no value interpolation)
   */
  addJoinClauses(filters: SearchFilters): string {
    const joins: string[] = [];

    // LEFT JOIN user_sports if sport filter is present
    if (filters.sport && filters.sport.length > 0) {
      // Return safe description without embedding actual values
      // Repository uses Knex query builder with proper parameterization
      if (filters.sport.length === 1) {
        joins.push('LEFT JOIN user_sports ON users.id = user_sports.user_id WHERE sport_name = ?');
      } else {
        joins.push(`LEFT JOIN user_sports ON users.id = user_sports.user_id WHERE sport_name IN (${filters.sport.map(() => '?').join(', ')})`);
      }
    }

    return joins.join(' ');
  }

  /**
   * Add ORDER BY clause
   *
   * @param searchQuery - Search query string (for relevance ordering)
   * @returns ORDER BY clause description
   */
  addOrderBy(searchQuery?: string): string {
    if (searchQuery && searchQuery.trim().length > 0) {
      return 'ORDER BY relevance_score DESC, created_at DESC';
    }
    return 'ORDER BY created_at DESC';
  }

  /**
   * Add pagination with bounds checking
   *
   * @param limit - Items per page
   * @param offset - Number of items to skip
   * @returns Pagination parameters with enforced bounds
   */
  addPagination(limit: number, offset: number): PaginationParams {
    // Enforce maximum limit of 100
    const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 100);

    // Enforce minimum offset of 0
    const safeOffset = Math.max(0, Math.floor(offset));

    return {
      limit: safeLimit,
      offset: safeOffset
    };
  }

  /**
   * Build complete search query object with validated parameters
   *
   * @param filters - Search filters
   * @param pagination - Pagination parameters
   * @returns Query object with safe, parameterized values
   */
  buildSearchQuery(
    filters: SearchFilters,
    pagination: PaginationParams
  ): QueryObject {
    // Build safe WHERE clause parameters
    const safeFilters = this.buildWhereClause(filters);

    // Apply pagination bounds
    const safePagination = this.addPagination(pagination.limit, pagination.offset);

    return {
      filters: safeFilters,
      pagination: safePagination
    };
  }

  /**
   * Apply filters to base query (delegates to repository)
   *
   * @param _baseQuery - Base query description (unused, kept for interface compatibility)
   * @param filters - Search filters
   * @returns Query object
   */
  applyFilters(_baseQuery: string, filters: SearchFilters): QueryObject {
    return {
      filters: this.buildWhereClause(filters),
      pagination: { limit: 20, offset: 0 } // Default pagination
    };
  }

  /**
   * Format search results (delegates to ranking service for sorting)
   *
   * @param users - Array of users
   * @param searchQuery - Search query string
   * @returns Sorted array of users
   */
  formatSearchResults(
    users: Omit<User, 'password_hash'>[],
    searchQuery?: string
  ): Omit<User, 'password_hash'>[] {
    // Apply relevance ranking if search query present
    return this.rankingService.sortByRelevance(users, searchQuery);
  }

  /**
   * Execute search with all filters, ranking, and pagination
   * Main public interface for user search
   *
   * @param filters - Search filters
   * @param pagination - Pagination parameters
   * @returns Paginated search results with ranking applied
   */
  async search(
    filters: SearchFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Omit<User, 'password_hash'>>> {
    try {
      // Build safe query
      const query = this.buildSearchQuery(filters, pagination);

      // Execute repository query
      const [users, total] = await Promise.all([
        this.repository.executeSearchQuery(query.filters, query.pagination),
        this.repository.countTotalResults(query.filters)
      ]);

      // Apply ranking/sorting
      const rankedUsers = this.formatSearchResults(users, filters.query);

      // Format with pagination metadata
      return this.paginationService.paginateResults(
        rankedUsers,
        total,
        query.pagination.limit,
        query.pagination.offset
      );
    } catch (error) {
      console.error('Error in UserSearchService.search:', error);
      throw error;
    }
  }
}
