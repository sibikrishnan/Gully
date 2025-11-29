/**
 * Integration Tests: User Search Repository
 * Tests database search queries with filters, JOINs, and pagination
 */

import db from '../../src/shared/database/connection';
import { UserSearchRepository } from '../../src/services/user-service/repositories/user-search.repository';

describe('User Search Repository Integration', () => {
  const repository = new UserSearchRepository();
  let testUserId1: number;
  let testUserId2: number;
  let testUserId3: number;
  let inactiveUserId: number;

  beforeAll(async () => {
    // Insert test users
    const [user1] = await db('users')
      .insert({
        email: 'search-test1@example.com',
        password_hash: 'hash1',
        username: 'pickleplayer',
        full_name: 'Pickle Player One',
        skill_level: 'intermediate',
        location_name: 'San Francisco, CA',
        status: 'active',
      })
      .returning('id');
    testUserId1 = user1.id;

    const [user2] = await db('users')
      .insert({
        email: 'search-test2@example.com',
        password_hash: 'hash2',
        username: 'paddlefan',
        full_name: 'Paddle Fan Two',
        skill_level: 'advanced',
        location_name: 'New York, NY',
        status: 'active',
      })
      .returning('id');
    testUserId2 = user2.id;

    const [user3] = await db('users')
      .insert({
        email: 'search-test3@example.com',
        password_hash: 'hash3',
        username: 'sportslover',
        full_name: 'Sports Lover Three',
        skill_level: 'beginner',
        location_name: 'San Francisco, CA',
        status: 'active',
      })
      .returning('id');
    testUserId3 = user3.id;

    // Insert inactive user (soft-deleted)
    const [inactiveUser] = await db('users')
      .insert({
        email: 'inactive@example.com',
        password_hash: 'hash4',
        username: 'inactiveplayer',
        full_name: 'Inactive Player',
        skill_level: 'expert',
        location_name: 'Los Angeles, CA',
        status: 'inactive', // Soft-deleted
      })
      .returning('id');
    inactiveUserId = inactiveUser.id;

    // Add sports to test users
    await db('user_sports').insert([
      { user_id: testUserId1, sport_name: 'pickleball', skill_level: 'intermediate' },
      { user_id: testUserId2, sport_name: 'paddle', skill_level: 'advanced' },
      { user_id: testUserId3, sport_name: 'pickleball', skill_level: 'beginner' },
      { user_id: inactiveUserId, sport_name: 'pickleball', skill_level: 'expert' },
    ]);
  });

  afterAll(async () => {
    // Cleanup
    await db('user_sports').whereIn('user_id', [testUserId1, testUserId2, testUserId3, inactiveUserId]).del();
    await db('users').whereIn('id', [testUserId1, testUserId2, testUserId3, inactiveUserId]).del();
  });

  describe('executeSearchQuery - Text Search', () => {
    it('should return users matching username filter (case-insensitive)', async () => {
      const results = await repository.executeSearchQuery(
        { query: 'pickle' },
        { limit: 10, offset: 0 }
      );

      expect(results.length).toBe(1);
      expect(results[0].username).toBe('pickleplayer');
    });

    it('should exclude soft-deleted users (status=inactive)', async () => {
      const results = await repository.executeSearchQuery(
        { query: 'player' }, // Matches both 'pickleplayer' and 'inactiveplayer'
        { limit: 10, offset: 0 }
      );

      // Should only return active user, not inactive
      expect(results.length).toBe(1);
      expect(results[0].username).toBe('pickleplayer');
      expect(results.every(u => u.status === 'active')).toBe(true);
    });
  });

  describe('executeSearchQuery - Sport Filter with JOIN', () => {
    it('should perform LEFT JOIN and return users with pickleball sport', async () => {
      const results = await repository.executeSearchQuery(
        { sport: ['pickleball'] },
        { limit: 10, offset: 0 }
      );

      // Should return testUserId1 and testUserId3 (both have pickleball)
      // Should NOT return inactiveUserId (soft-deleted)
      expect(results.length).toBe(2);
      const usernames = results.map(u => u.username);
      expect(usernames).toContain('pickleplayer');
      expect(usernames).toContain('sportslover');
      expect(usernames).not.toContain('inactiveplayer'); // Inactive excluded
    });

    it('should handle multiple sport filters with IN clause', async () => {
      const results = await repository.executeSearchQuery(
        { sport: ['pickleball', 'paddle'] },
        { limit: 10, offset: 0 }
      );

      // Should return users with either pickleball or paddle
      expect(results.length).toBeGreaterThanOrEqual(3); // At least our 3 active test users
      const usernames = results.map(u => u.username);
      expect(usernames).toContain('pickleplayer'); // pickleball
      expect(usernames).toContain('paddlefan'); // paddle
      expect(usernames).toContain('sportslover'); // pickleball
    });
  });

  describe('countTotalResults', () => {
    it('should return accurate count matching search filters', async () => {
      const count = await repository.countTotalResults({ query: 'pickle' });

      expect(count).toBe(1); // Only 'pickleplayer' (active)
    });

    it('should count correctly with sport filter avoiding duplicates', async () => {
      const count = await repository.countTotalResults({ sport: ['pickleball'] });

      // Should count 2 active users with pickleball (not including inactive user)
      expect(count).toBe(2);
    });
  });

  describe('Combined Filters', () => {
    it('should handle location and skill level filters together', async () => {
      const results = await repository.executeSearchQuery(
        { location_city: 'San Francisco', skill_level: 'intermediate' },
        { limit: 10, offset: 0 }
      );

      expect(results.length).toBe(1);
      expect(results[0].username).toBe('pickleplayer');
      expect(results[0].skill_level).toBe('intermediate');
    });
  });
});
