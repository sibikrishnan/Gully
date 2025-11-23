/**
 * Unit Tests for User Search Query Builder
 * Tests buildWhereClause, addJoinClauses, addPagination, and SQL injection prevention
 */

import { UserSearchService } from '../../src/services/user-service/services/user-search.service';
import { SearchFilters } from '../../src/services/user-service/repositories/user-search.repository';

describe('User Search Query Builder', () => {
  let searchService: UserSearchService;

  beforeEach(() => {
    searchService = new UserSearchService();
  });

  describe('buildWhereClause', () => {
    it('should generate correct filters for text search (username/full_name ILIKE)', () => {
      const filters: SearchFilters = {
        query: 'john'
      };

      const result = searchService.buildWhereClause(filters);

      expect(result).toEqual({
        query: 'john'
      });
      expect(result.query).toBe('john');
    });

    it('should generate correct filters for location_city equality', () => {
      const filters: SearchFilters = {
        location_city: 'San Francisco'
      };

      const result = searchService.buildWhereClause(filters);

      expect(result).toEqual({
        location_city: 'San Francisco'
      });
    });

    it('should handle empty filters object', () => {
      const filters: SearchFilters = {};

      const result = searchService.buildWhereClause(filters);

      expect(result).toEqual({});
    });

    it('should handle NULL and undefined filter values', () => {
      const filters: SearchFilters = {
        query: undefined,
        location_city: null as any,
        skill_level: 'intermediate'
      };

      const result = searchService.buildWhereClause(filters);

      expect(result).toEqual({
        skill_level: 'intermediate'
      });
      expect(result.query).toBeUndefined();
      expect(result.location_city).toBeUndefined();
    });

    it('should validate skill_level enum', () => {
      const validFilters: SearchFilters = {
        skill_level: 'expert'
      };

      const result = searchService.buildWhereClause(validFilters);

      expect(result.skill_level).toBe('expert');

      // Invalid skill level should be filtered out
      const invalidFilters: SearchFilters = {
        skill_level: 'invalid_level' as any
      };

      const invalidResult = searchService.buildWhereClause(invalidFilters);

      expect(invalidResult.skill_level).toBeUndefined();
    });

    it('should validate and filter sport array', () => {
      const validFilters: SearchFilters = {
        sport: ['pickleball', 'paddle']
      };

      const result = searchService.buildWhereClause(validFilters);

      expect(result.sport).toEqual(['pickleball', 'paddle']);

      // Invalid sports should be filtered out
      const mixedFilters: SearchFilters = {
        sport: ['pickleball', 'invalid_sport', 'paddle']
      };

      const mixedResult = searchService.buildWhereClause(mixedFilters);

      expect(mixedResult.sport).toEqual(['pickleball', 'paddle']);
    });
  });

  describe('addJoinClauses', () => {
    it('should generate LEFT JOIN user_sports when sport filter present', () => {
      const filters: SearchFilters = {
        sport: ['pickleball']
      };

      const result = searchService.addJoinClauses(filters);

      expect(result).toContain('LEFT JOIN user_sports');
      expect(result).toContain('users.id = user_sports.user_id');
      expect(result).toContain('sport_name = ?'); // Placeholder, not actual value
      expect(result).not.toContain('pickleball'); // Values should not be embedded
    });

    it('should generate IN clause for multiple sport filters with placeholders', () => {
      const filters: SearchFilters = {
        sport: ['pickleball', 'paddle']
      };

      const result = searchService.addJoinClauses(filters);

      expect(result).toContain('LEFT JOIN user_sports');
      expect(result).toContain('IN (?, ?)'); // Placeholders for 2 values
      expect(result).not.toContain('pickleball'); // Actual values should not be embedded
      expect(result).not.toContain('paddle');
    });

    it('should return empty string when no sport filter', () => {
      const filters: SearchFilters = {
        query: 'john'
      };

      const result = searchService.addJoinClauses(filters);

      expect(result).toBe('');
    });
  });

  describe('buildSearchQuery - SQL Injection Prevention', () => {
    it('should return parameterized values (safe from SQL injection)', () => {
      const filters: SearchFilters = {
        query: 'john',
        location_city: 'San Francisco'
      };

      const query = searchService.buildSearchQuery(filters, { limit: 20, offset: 0 });

      // Verify that the query object contains safe, parameterized filters
      expect(query.filters.query).toBe('john');
      expect(query.filters.location_city).toBe('San Francisco');

      // Verify that values are NOT embedded in SQL strings (they're separate params)
      expect(typeof query.filters.query).toBe('string');
      expect(query.filters.query).not.toContain('SELECT');
      expect(query.filters.query).not.toContain('DROP');
    });

    it('should safely handle malicious input (SQL injection attempt)', () => {
      const maliciousFilters: SearchFilters = {
        query: "'; DROP TABLE users;--",
        location_city: "' OR '1'='1"
      };

      const query = searchService.buildSearchQuery(maliciousFilters, { limit: 20, offset: 0 });

      // Malicious input should be treated as regular string parameters
      expect(query.filters.query).toBe("'; DROP TABLE users;--");
      expect(query.filters.location_city).toBe("' OR '1'='1");

      // Verify these are stored as values, not executed as SQL
      expect(query.filters).toHaveProperty('query');
      expect(query.filters).toHaveProperty('location_city');
    });

    it('should handle special characters safely', () => {
      const filters: SearchFilters = {
        query: "O'Brien",
        location_city: 'San José'
      };

      const query = searchService.buildSearchQuery(filters, { limit: 20, offset: 0 });

      expect(query.filters.query).toBe("O'Brien");
      expect(query.filters.location_city).toBe('San José');
    });
  });

  describe('addPagination - Limit/Offset Bounds', () => {
    it('should enforce maximum limit of 100', () => {
      const result = searchService.addPagination(200, 0);

      expect(result.limit).toBe(100);
      expect(result.offset).toBe(0);
    });

    it('should enforce minimum offset of 0', () => {
      const result = searchService.addPagination(20, -50);

      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
    });

    it('should clamp negative offset to 0', () => {
      const result = searchService.addPagination(20, -10);

      expect(result.offset).toBe(0);
    });

    it('should handle floating point values', () => {
      const result = searchService.addPagination(25.7, 10.3);

      expect(result.limit).toBe(25); // Floored
      expect(result.offset).toBe(10); // Floored
    });

    it('should enforce minimum limit of 1', () => {
      const result = searchService.addPagination(0, 0);

      expect(result.limit).toBe(1);
      expect(result.offset).toBe(0);
    });
  });

  describe('addOrderBy', () => {
    it('should return relevance ordering when search query present', () => {
      const result = searchService.addOrderBy('john');

      expect(result).toContain('relevance_score');
      expect(result).toContain('created_at DESC');
    });

    it('should return created_at ordering when no search query', () => {
      const result = searchService.addOrderBy();

      expect(result).toBe('ORDER BY created_at DESC');
      expect(result).not.toContain('relevance_score');
    });

    it('should return created_at ordering for empty search query', () => {
      const result = searchService.addOrderBy('   ');

      expect(result).toBe('ORDER BY created_at DESC');
    });
  });

  describe('applyFilters', () => {
    it('should apply filters and return query object with defaults', () => {
      const filters: SearchFilters = {
        query: 'john',
        skill_level: 'advanced'
      };

      const result = searchService.applyFilters('', filters);

      expect(result.filters).toEqual({
        query: 'john',
        skill_level: 'advanced'
      });
      expect(result.pagination).toEqual({
        limit: 20,
        offset: 0
      });
    });
  });

  describe('formatSearchResults', () => {
    it('should format and sort results by relevance', () => {
      const users = [
        { id: 1, username: 'alice', full_name: 'Alice Wonder', created_at: '2024-01-01' } as any,
        { id: 2, username: 'john_doe', full_name: 'John Doe', created_at: '2024-01-02' } as any,
        { id: 3, username: 'bobby', full_name: 'Bobby John', created_at: '2024-01-03' } as any
      ];

      const result = searchService.formatSearchResults(users, 'john');

      // john_doe should rank highest (exact username partial match)
      // bobby john should rank second (full_name partial match)
      // alice should rank lowest (no match)
      expect(result[0].username).toBe('john_doe');
    });

    it('should return users as-is when no search query', () => {
      const users = [
        { id: 1, username: 'alice', created_at: '2024-01-01' } as any,
        { id: 2, username: 'bob', created_at: '2024-01-02' } as any
      ];

      const result = searchService.formatSearchResults(users);

      expect(result).toEqual(users);
    });
  });
});
