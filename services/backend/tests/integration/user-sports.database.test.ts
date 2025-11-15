/**
 * Integration Tests: User Sports Database Operations
 * Tests database constraints, foreign keys, and transactions for user_sports table
 */

import db from '../../src/shared/database/connection';
import { UserSportsRepository } from '../../src/services/user-service/repositories/user-sports.repository';

describe('User Sports Database Integration', () => {
  const repository = new UserSportsRepository();
  let testUserId1: number;
  let testUserId2: number;

  beforeAll(async () => {
    // Insert test users
    const [user1] = await db('users')
      .insert({
        email: 'sports-db-test1@example.com',
        password_hash: 'hash1',
        username: 'sports_db_user1',
        full_name: 'Sports DB User 1',
        skill_level: 'intermediate',
        preferred_radius_km: 10,
        status: 'active',
      })
      .returning('id');
    testUserId1 = user1.id;

    const [user2] = await db('users')
      .insert({
        email: 'sports-db-test2@example.com',
        password_hash: 'hash2',
        username: 'sports_db_user2',
        full_name: 'Sports DB User 2',
        skill_level: 'beginner',
        preferred_radius_km: 15,
        status: 'active',
      })
      .returning('id');
    testUserId2 = user2.id;
  });

  afterAll(async () => {
    // Cleanup
    await db('user_sports').whereIn('user_id', [testUserId1, testUserId2]).del();
    await db('users').whereIn('id', [testUserId1, testUserId2]).del();
  });

  afterEach(async () => {
    // Clear sports after each test
    await db('user_sports').whereIn('user_id', [testUserId1, testUserId2]).del();
  });

  describe('Database Constraints', () => {
    it('should enforce unique constraint on (user_id, sport_name)', async () => {
      // Insert first sport
      await db('user_sports').insert({
        user_id: testUserId1,
        sport_name: 'pickleball',
        skill_level: 'intermediate',
      });

      // Attempt duplicate insert - should fail
      await expect(
        db('user_sports').insert({
          user_id: testUserId1,
          sport_name: 'pickleball',
          skill_level: 'advanced',
        })
      ).rejects.toThrow();

      // Verify only one record exists
      const count = await db('user_sports')
        .where({ user_id: testUserId1, sport_name: 'pickleball' })
        .count('* as count')
        .first();
      expect(Number(count?.count)).toBe(1);
    });

    it('should enforce foreign key constraint on user_id', async () => {
      const nonExistentUserId = 999999;

      // Attempt insert with non-existent user_id
      await expect(
        repository.addUserSport(nonExistentUserId, {
          sport_name: 'pickleball',
          skill_level: 'beginner',
        })
      ).rejects.toThrow(/User not found/);
    });

    it('should cascade delete sports when user is deleted', async () => {
      // Create temporary user
      const [tempUser] = await db('users')
        .insert({
          email: 'temp-cascade-user@example.com',
          password_hash: 'temp',
          username: 'temp_cascade',
          full_name: 'Temp Cascade User',
          skill_level: 'beginner',
          preferred_radius_km: 10,
          status: 'active',
        })
        .returning('id');
      const tempUserId = tempUser.id;

      // Add sports to temp user
      await db('user_sports').insert([
        {
          user_id: tempUserId,
          sport_name: 'pickleball',
          skill_level: 'beginner',
        },
        {
          user_id: tempUserId,
          sport_name: 'paddle',
          skill_level: 'intermediate',
        },
      ]);

      // Verify sports exist
      const sportsBeforeDelete = await db('user_sports')
        .where('user_id', tempUserId)
        .select('*');
      expect(sportsBeforeDelete).toHaveLength(2);

      // Delete user (should cascade)
      await db('users').where('id', tempUserId).del();

      // Verify sports are deleted via CASCADE
      const sportsAfterDelete = await db('user_sports')
        .where('user_id', tempUserId)
        .select('*');
      expect(sportsAfterDelete).toHaveLength(0);
    });

    it('should allow same sport for different users', async () => {
      // Add pickleball to both users
      await repository.addUserSport(testUserId1, {
        sport_name: 'pickleball',
        skill_level: 'intermediate',
      });

      await repository.addUserSport(testUserId2, {
        sport_name: 'pickleball',
        skill_level: 'beginner',
      });

      // Verify both records exist
      const user1Sports = await repository.getUserSports(testUserId1);
      const user2Sports = await repository.getUserSports(testUserId2);

      expect(user1Sports).toHaveLength(1);
      expect(user1Sports[0].sport_name).toBe('pickleball');
      expect(user1Sports[0].skill_level).toBe('intermediate');

      expect(user2Sports).toHaveLength(1);
      expect(user2Sports[0].sport_name).toBe('pickleball');
      expect(user2Sports[0].skill_level).toBe('beginner');
    });
  });
});
