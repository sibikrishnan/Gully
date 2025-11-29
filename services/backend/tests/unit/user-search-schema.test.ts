/**
 * Unit Tests: User Search Schema Validation
 * Tests Zod validation for search query parameters
 */

import { searchParamsSchema } from '../../src/services/user-service/schemas/user-search.schema';

describe('User Search Schema Validation', () => {
  describe('Valid Parameters', () => {
    it('should pass validation with all valid parameters and apply defaults', () => {
      const params = {
        query: 'test',
        location_city: 'San Francisco',
        sport: ['pickleball'],
        skill_level: 'intermediate' as const,
      };

      const result = searchParamsSchema.parse(params);

      expect(result.query).toBe('test');
      expect(result.location_city).toBe('San Francisco');
      expect(result.sport).toEqual(['pickleball']);
      expect(result.skill_level).toBe('intermediate');
      expect(result.limit).toBe(20); // Default
      expect(result.offset).toBe(0); // Default
    });

    it('should apply default limit=20 and offset=0 when not provided', () => {
      const params = {
        query: 'search',
      };

      const result = searchParamsSchema.parse(params);

      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
    });

    it('should parse string values for limit and offset', () => {
      const params = {
        limit: '50',
        offset: '10',
      };

      const result = searchParamsSchema.parse(params);

      expect(result.limit).toBe(50);
      expect(result.offset).toBe(10);
    });

    it('should convert single sport string to array', () => {
      const params = {
        sport: 'pickleball', // Single string
      };

      const result = searchParamsSchema.parse(params);

      expect(Array.isArray(result.sport)).toBe(true);
      expect(result.sport).toEqual(['pickleball']);
    });
  });

  describe('Invalid Parameters', () => {
    it('should reject limit > 100', () => {
      const params = {
        limit: 101,
      };

      expect(() => searchParamsSchema.parse(params)).toThrow();
    });

    it('should reject negative offset', () => {
      const params = {
        offset: -1,
      };

      expect(() => searchParamsSchema.parse(params)).toThrow();
    });

    it('should reject invalid skill_level enum', () => {
      const params = {
        skill_level: 'master', // Invalid value
      };

      expect(() => searchParamsSchema.parse(params)).toThrow();
    });

    it('should reject invalid sport enum', () => {
      const params = {
        sport: ['tennis'], // Invalid sport
      };

      expect(() => searchParamsSchema.parse(params)).toThrow('Sport must be one of: pickleball, paddle');
    });

    it('should reject limit = 0', () => {
      const params = {
        limit: 0,
      };

      expect(() => searchParamsSchema.parse(params)).toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty query string', () => {
      const params = {
        query: '',
      };

      const result = searchParamsSchema.parse(params);
      expect(result.query).toBe('');
    });

    it('should handle multiple sports', () => {
      const params = {
        sport: ['pickleball', 'paddle'],
      };

      const result = searchParamsSchema.parse(params);
      expect(result.sport).toEqual(['pickleball', 'paddle']);
    });
  });
});
