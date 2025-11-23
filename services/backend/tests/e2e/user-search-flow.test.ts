/**
 * E2E Tests: User Search Flow
 * Tests complete user search functionality from HTTP request through database and back
 * P2-PROF-T5.4 - 7 MVP E2E tests
 */

import request from 'supertest';
import app from '../../src/app';
import db from '../../src/shared/database/connection';

describe('User Search E2E Flow', () => {
  let testUserIds: number[] = [];

  /**
   * Helper: Create test user with specified data
   */
  async function createTestUser(userData: {
    email: string;
    username: string;
    full_name: string;
    phone_number: string;
    skill_level?: string;
    location_name?: string;
    preferred_radius_km?: number;
  }) {
    const [user] = await db('users')
      .insert({
        email: userData.email,
        password_hash: 'hash123',
        username: userData.username,
        full_name: userData.full_name,
        phone_number: userData.phone_number,
        skill_level: userData.skill_level || 'intermediate',
        preferred_radius_km: userData.preferred_radius_km || 10,
        location_name: userData.location_name || 'Test City',
        status: 'active',
      })
      .returning('*');

    testUserIds.push(user.id);
    return user;
  }

  /**
   * Helper: Create test user with sports
   */
  async function createTestUserWithSports(
    userData: {
      email: string;
      username: string;
      full_name: string;
      phone_number: string;
      skill_level?: string;
      location_name?: string;
    },
    sports: Array<{ sport_name: string; skill_level: string }>
  ) {
    const user = await createTestUser(userData);

    // Add sports
    await db('user_sports').insert(
      sports.map(sport => ({
        user_id: user.id,
        sport_name: sport.sport_name,
        skill_level: sport.skill_level,
      }))
    );

    return user;
  }

  /**
   * Helper: Make search request
   */
  async function makeSearchRequest(params: {
    query?: string;
    location_city?: string;
    sport?: string;
    skill_level?: string;
    limit?: number;
    offset?: number;
  }) {
    return request(app).get('/api/users/search').query(params);
  }

  afterEach(async () => {
    // Cleanup: delete user_sports entries
    if (testUserIds.length > 0) {
      await db('user_sports').whereIn('user_id', testUserIds).del();
      // Cleanup: delete test users
      await db('users').whereIn('id', testUserIds).del();
      testUserIds = [];
    }
  });

  afterAll(async () => {
    await db.destroy();
  });

  /**
   * E2E Test 1: Search for pickleball players
   * Verifies basic sport filtering works end-to-end
   */
  describe('E2E Test 1: Search for pickleball players', () => {
    it('should return only pickleball players when searching by sport', async () => {
      // Create test users: 2 with pickleball, 1 with paddle
      await createTestUserWithSports(
        {
          email: 'pickleball1@example.com',
          username: 'player1',
          full_name: 'Pickleball Player 1',
          phone_number: '+1111111111',
          location_name: 'New York',
        },
        [{ sport_name: 'pickleball', skill_level: 'intermediate' }]
      );

      await createTestUserWithSports(
        {
          email: 'pickleball2@example.com',
          username: 'player2',
          full_name: 'Pickleball Player 2',
          phone_number: '+1111111112',
          location_name: 'Boston',
        },
        [{ sport_name: 'pickleball', skill_level: 'advanced' }]
      );

      await createTestUserWithSports(
        {
          email: 'paddle@example.com',
          username: 'paddle_player',
          full_name: 'Paddle Player',
          phone_number: '+1111111113',
          location_name: 'Chicago',
        },
        [{ sport_name: 'paddle', skill_level: 'intermediate' }]
      );

      // Search for pickleball players
      const response = await makeSearchRequest({ sport: 'pickleball' });

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);

      // Verify all results have pickleball sport
      const usernames = response.body.data.map((u: any) => u.username);
      expect(usernames).toContain('player1');
      expect(usernames).toContain('player2');
      expect(usernames).not.toContain('paddle_player');
    });
  });

  /**
   * E2E Test 2: Search with filters and pagination
   * Verifies multi-page results with location filter
   */
  describe('E2E Test 2: Search with filters and pagination', () => {
    it('should handle pagination with location filter across multiple pages', async () => {
      // Create 25 users in San Francisco
      for (let i = 0; i < 25; i++) {
        await createTestUser({
          email: `sf-user-${i}@example.com`,
          username: `sf_user_${i}`,
          full_name: `SF User ${i}`,
          phone_number: `+122222${i.toString().padStart(4, '0')}`,
          location_name: 'San Francisco',
        });
      }

      // First page: 10 results
      const page1 = await makeSearchRequest({
        location_city: 'San Francisco',
        limit: 10,
        offset: 0,
      });

      expect(page1.status).toBe(200);
      expect(page1.body.data).toHaveLength(10);
      expect(page1.body.pagination.total).toBe(25);
      expect(page1.body.pagination.limit).toBe(10);
      expect(page1.body.pagination.offset).toBe(0);
      expect(page1.body.pagination.hasMore).toBe(true);

      // Second page: 10 results
      const page2 = await makeSearchRequest({
        location_city: 'San Francisco',
        limit: 10,
        offset: 10,
      });

      expect(page2.status).toBe(200);
      expect(page2.body.data).toHaveLength(10);
      expect(page2.body.pagination.offset).toBe(10);
      expect(page2.body.pagination.hasMore).toBe(true);

      // Third page: 5 results
      const page3 = await makeSearchRequest({
        location_city: 'San Francisco',
        limit: 10,
        offset: 20,
      });

      expect(page3.status).toBe(200);
      expect(page3.body.data).toHaveLength(5);
      expect(page3.body.pagination.offset).toBe(20);
      expect(page3.body.pagination.hasMore).toBe(false);

      // Verify no duplicate users across pages
      const page1Ids = page1.body.data.map((u: any) => u.id);
      const page2Ids = page2.body.data.map((u: any) => u.id);
      const page3Ids = page3.body.data.map((u: any) => u.id);

      const allIds = [...page1Ids, ...page2Ids, ...page3Ids];
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(25); // No duplicates
    });
  });

  /**
   * E2E Test 3: Create user then search and find in results
   * Verifies new users appear immediately in search results
   */
  describe('E2E Test 3: Create user then search and find in results', () => {
    it('should find newly created user in search results immediately', async () => {
      // Create user with specific username
      const newUser = await createTestUserWithSports(
        {
          email: 'testplayer@example.com',
          username: 'testplayer',
          full_name: 'Test Player',
          phone_number: '+1333333333',
          location_name: 'Miami',
        },
        [{ sport_name: 'pickleball', skill_level: 'intermediate' }]
      );

      // Search for the user by username
      const response = await makeSearchRequest({ query: 'testplayer' });

      // Verify user appears in results
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);

      const foundUser = response.body.data.find((u: any) => u.username === 'testplayer');
      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(newUser.id);
      expect(foundUser.full_name).toBe('Test Player');
    });
  });

  /**
   * E2E Test 4: Soft delete user then verify exclusion
   * Verifies deleted users don't appear in search results
   */
  describe('E2E Test 4: Soft delete user then verify exclusion', () => {
    it('should exclude soft-deleted users from search results', async () => {
      // Create active user with pickleball
      const user = await createTestUserWithSports(
        {
          email: 'deleteme@example.com',
          username: 'delete_user',
          full_name: 'Delete Me',
          phone_number: '+1444444444',
          location_name: 'Austin',
        },
        [{ sport_name: 'pickleball', skill_level: 'advanced' }]
      );

      // Verify user appears in search
      const beforeDelete = await makeSearchRequest({ sport: 'pickleball' });
      expect(beforeDelete.body.data.some((u: any) => u.id === user.id)).toBe(true);

      // Soft delete user (set status to inactive)
      await db('users').where({ id: user.id }).update({ status: 'inactive' });

      // Verify user no longer appears in search
      const afterDelete = await makeSearchRequest({ sport: 'pickleball' });
      expect(afterDelete.body.data.some((u: any) => u.id === user.id)).toBe(false);
    });
  });

  /**
   * E2E Test 5: Complex multi-filter search
   * Verifies multiple filters work correctly together
   */
  describe('E2E Test 5: Complex multi-filter search', () => {
    it('should return only users matching ALL filters (sport + skill_level + location)', async () => {
      // Create users with various combinations
      await createTestUserWithSports(
        {
          email: 'match@example.com',
          username: 'perfect_match',
          full_name: 'Perfect Match',
          phone_number: '+1555555551',
          skill_level: 'advanced',
          location_name: 'New York City',
        },
        [{ sport_name: 'pickleball', skill_level: 'advanced' }]
      );

      await createTestUserWithSports(
        {
          email: 'wrong-skill@example.com',
          username: 'wrong_skill',
          full_name: 'Wrong Skill',
          phone_number: '+1555555552',
          skill_level: 'beginner', // Different skill level
          location_name: 'New York City',
        },
        [{ sport_name: 'pickleball', skill_level: 'beginner' }]
      );

      await createTestUserWithSports(
        {
          email: 'wrong-location@example.com',
          username: 'wrong_location',
          full_name: 'Wrong Location',
          phone_number: '+1555555553',
          skill_level: 'advanced',
          location_name: 'Los Angeles', // Different location
        },
        [{ sport_name: 'pickleball', skill_level: 'advanced' }]
      );

      await createTestUserWithSports(
        {
          email: 'wrong-sport@example.com',
          username: 'wrong_sport',
          full_name: 'Wrong Sport',
          phone_number: '+1555555554',
          skill_level: 'advanced',
          location_name: 'New York City',
        },
        [{ sport_name: 'paddle', skill_level: 'advanced' }] // Different sport
      );

      // Search with all filters
      const response = await makeSearchRequest({
        sport: 'pickleball',
        skill_level: 'advanced',
        location_city: 'New York City',
      });

      // Verify only the perfect match is returned
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].username).toBe('perfect_match');
    });
  });

  /**
   * E2E Test 6: Search during user creation (concurrency)
   * Verifies concurrent operations don't cause errors
   */
  describe('E2E Test 6: Search during user creation (concurrency)', () => {
    it('should handle concurrent search and user creation without errors', async () => {
      // Create initial user
      await createTestUserWithSports(
        {
          email: 'initial@example.com',
          username: 'initial_user',
          full_name: 'Initial User',
          phone_number: '+1666666661',
          location_name: 'Seattle',
        },
        [{ sport_name: 'pickleball', skill_level: 'intermediate' }]
      );

      // Execute search and user creation concurrently
      const [searchResponse, newUser] = await Promise.all([
        makeSearchRequest({ sport: 'pickleball' }),
        createTestUserWithSports(
          {
            email: 'concurrent@example.com',
            username: 'concurrent_user',
            full_name: 'Concurrent User',
            phone_number: '+1666666662',
            location_name: 'Portland',
          },
          [{ sport_name: 'pickleball', skill_level: 'advanced' }]
        ),
      ]);

      // Verify no errors occurred
      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.data).toBeDefined();
      expect(Array.isArray(searchResponse.body.data)).toBe(true);
      expect(newUser).toBeDefined();
      expect(newUser.username).toBe('concurrent_user');

      // At minimum, the initial user should be in results
      // The concurrent user may or may not appear depending on timing
      expect(searchResponse.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  /**
   * E2E Test 7: Search result ordering by relevance
   * Verifies ranking algorithm produces correct result order
   */
  describe('E2E Test 7: Search result ordering by relevance', () => {
    it('should rank exact username matches higher than partial matches', async () => {
      // Create users with different username matches
      await createTestUser({
        email: 'exact@example.com',
        username: 'pickleball', // Exact match
        full_name: 'Exact Match',
        phone_number: '+1777777771',
        location_name: 'Denver',
      });

      await createTestUser({
        email: 'partial1@example.com',
        username: 'pickleballfan', // Starts with query
        full_name: 'Partial Match 1',
        phone_number: '+1777777772',
        location_name: 'Denver',
      });

      await createTestUser({
        email: 'partial2@example.com',
        username: 'paddle_pickleball', // Contains query
        full_name: 'Partial Match 2',
        phone_number: '+1777777773',
        location_name: 'Denver',
      });

      // Search for "pickleball"
      const response = await makeSearchRequest({ query: 'pickleball' });

      // Verify results
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);

      // Verify exact match ranks first
      expect(response.body.data[0].username).toBe('pickleball');

      // Verify other matches are present (order may vary based on ranking algorithm)
      const usernames = response.body.data.map((u: any) => u.username);
      expect(usernames).toContain('pickleballfan');
      expect(usernames).toContain('paddle_pickleball');
    });
  });
});
