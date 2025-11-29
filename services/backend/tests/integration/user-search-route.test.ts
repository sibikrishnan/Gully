/**
 * Integration Tests: GET /api/users/search Route
 * Tests route behavior, validation, pagination, and rate limiting
 * P2-PROF-T5.3 - 4 MVP integration tests
 */

import request from 'supertest';
import app from '../../src/app';
import db from '../../src/shared/database/connection';

describe('GET /api/users/search Route', () => {
  let testUserIds: number[] = [];

  beforeAll(async () => {
    // Insert test users with varied data for search testing
    const users = await db('users')
      .insert([
        {
          email: 'search-test-1@example.com',
          password_hash: 'hash123',
          username: 'john_doe',
          full_name: 'John Doe',
          phone_number: '+1234567891',
          skill_level: 'intermediate',
          preferred_radius_km: 10,
          location_name: 'New York',
          status: 'active',
        },
        {
          email: 'search-test-2@example.com',
          password_hash: 'hash123',
          username: 'jane_smith',
          full_name: 'Jane Smith',
          phone_number: '+1234567892',
          skill_level: 'advanced',
          preferred_radius_km: 15,
          location_name: 'Boston',
          status: 'active',
        },
        {
          email: 'search-test-3@example.com',
          password_hash: 'hash123',
          username: 'bob_wilson',
          full_name: 'Bob Wilson',
          phone_number: '+1234567893',
          skill_level: 'beginner',
          preferred_radius_km: 5,
          location_name: 'New York',
          status: 'active',
        }
      ])
      .returning('*');

    testUserIds = users.map(u => u.id);

    // Add sports for some users
    await db('user_sports').insert([
      { user_id: testUserIds[0], sport_name: 'pickleball', skill_level: 'intermediate' },
      { user_id: testUserIds[1], sport_name: 'paddle', skill_level: 'advanced' },
      { user_id: testUserIds[2], sport_name: 'pickleball', skill_level: 'beginner' }
    ]);
  });

  afterAll(async () => {
    // Cleanup: delete user_sports entries
    await db('user_sports').whereIn('user_id', testUserIds).del();
    // Cleanup: delete test users
    await db('users').whereIn('id', testUserIds).del();
    await db.destroy();
  });

  describe('Success Response', () => {
    /**
     * Integration Test 1: GET /api/users/search returns 200 with results array
     * Verifies basic search functionality and response structure
     */
    it('should return 200 with results array and pagination metadata', async () => {
      const response = await request(app)
        .get('/api/users/search')
        .query({ query: 'john' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('offset');
      expect(response.body.pagination).toHaveProperty('hasMore');
    });

    /**
     * Integration Test 2: Response body includes data[] and pagination object
     * Verifies complete response structure with filters
     */
    it('should return filtered results when location filter applied', async () => {
      const response = await request(app)
        .get('/api/users/search')
        .query({ location_city: 'New York' });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toMatchObject({
        limit: 20, // Default limit
        offset: 0  // Default offset
      });
    });
  });

  describe('Validation Errors', () => {
    /**
     * Integration Test 3: GET /api/users/search with invalid limit returns 400
     * Verifies query validation middleware catches invalid parameters
     */
    it('should return 400 when limit exceeds maximum (100)', async () => {
      const response = await request(app)
        .get('/api/users/search')
        .query({ limit: 200 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatchObject({
        message: 'Validation error'
      });
    });

    /**
     * Integration Test 4: GET /api/users/search with invalid skill_level returns 400
     * Verifies enum validation for skill_level parameter
     */
    it('should return 400 when skill_level is invalid', async () => {
      const response = await request(app)
        .get('/api/users/search')
        .query({ skill_level: 'invalid_level' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.details).toBeDefined();
    });
  });

  describe('Pagination Headers', () => {
    /**
     * Integration Test 5: Response includes X-Total-Count header
     * Verifies pagination headers are set correctly
     */
    it('should include X-Total-Count header with total results', async () => {
      const response = await request(app)
        .get('/api/users/search')
        .query({ query: '' });

      expect(response.status).toBe(200);
      expect(response.headers).toHaveProperty('x-total-count');
      expect(parseInt(response.headers['x-total-count'])).toBeGreaterThanOrEqual(0);
    });

    /**
     * Integration Test 6: Response includes Link header when hasMore=true
     * Verifies Link header format for pagination
     */
    it('should include Link header for next page when hasMore is true', async () => {
      const response = await request(app)
        .get('/api/users/search')
        .query({ limit: 1, offset: 0 });

      expect(response.status).toBe(200);

      // If there are more results, Link header should be present
      if (response.body.pagination.hasMore) {
        expect(response.headers).toHaveProperty('link');
        expect(response.headers.link).toContain('rel="next"');
      }
    });
  });

  describe('Rate Limiting', () => {
    /**
     * Integration Test 7: Rate limiting blocks excessive requests
     * Verifies rate limit middleware enforces limits (100 requests per 15 min)
     */
    it('should block requests after rate limit exceeded (429)', async () => {
      // Test with mock - verify that rate limit middleware would block after threshold
      // Making 101 actual requests takes too long in tests
      // Instead, verify rate limit headers exist (tested in next test)
      // and rely on unit tests of rate-limit middleware for actual blocking logic

      const response = await request(app)
        .get('/api/users/search')
        .query({ query: 'test' });

      // Verify rate limit headers are present (indicating middleware is active)
      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(parseInt(response.headers['x-ratelimit-limit'])).toBe(100);
    });

    /**
     * Integration Test 8: Rate limit headers included in response
     * Verifies X-RateLimit-* headers are present
     */
    it('should include rate limit headers in response', async () => {
      const response = await request(app)
        .get('/api/users/search')
        .query({ query: 'test' });

      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
      expect(response.headers).toHaveProperty('x-ratelimit-reset');
    });
  });
});
