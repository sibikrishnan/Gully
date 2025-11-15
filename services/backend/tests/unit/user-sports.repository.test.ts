/**
 * Unit Tests: UserSportsRepository
 * Tests repository methods for user_sports junction table with real database
 */

import { UserSportsRepository } from '../../src/services/user-service/repositories/user-sports.repository';
import db from '../../src/shared/database/connection';

describe('UserSportsRepository', () => {
  const repository = new UserSportsRepository();
  let testUserId: number;

  beforeAll(async () => {
    // Insert test user
    const [user] = await db('users')
      .insert({
        email: 'sports-repo-test@example.com',
        password_hash: 'hash123',
        username: 'sports_repo_user',
        full_name: 'Sports Repo User',
        skill_level: 'intermediate',
        preferred_radius_km: 10,
        status: 'active',
      })
      .returning('id');
    testUserId = user.id;
  });

  afterAll(async () => {
    // Cleanup
    await db('user_sports').where('user_id', testUserId).del();
    await db('users').where('id', testUserId).del();
  });

  afterEach(async () => {
    // Clear sports after each test
    await db('user_sports').where('user_id', testUserId).del();
  });

  describe('addUserSport', () => {
    it('should successfully insert a sport preference', async () => {
      const sportData = {
        sport_name: 'pickleball' as const,
        skill_level: 'intermediate' as const,
        years_experience: 3,
        preferred_position: 'Doubles',
      };

      const result = await repository.addUserSport(testUserId, sportData);

      expect(result).toBeDefined();
      expect(result.sport_name).toBe('pickleball');
      expect(result.skill_level).toBe('intermediate');
      expect(result.years_experience).toBe(3);
      expect(result.preferred_position).toBe('Doubles');

      // Verify in database
      const dbRecord = await db('user_sports')
        .where({ user_id: testUserId, sport_name: 'pickleball' })
        .first();
      expect(dbRecord).toBeDefined();
    });

    it('should throw DUPLICATE_SPORT error when adding duplicate sport', async () => {
      // Insert first sport
      await repository.addUserSport(testUserId, {
        sport_name: 'paddle',
        skill_level: 'beginner',
      });

      // Attempt to insert duplicate
      await expect(
        repository.addUserSport(testUserId, {
          sport_name: 'paddle',
          skill_level: 'advanced',
        })
      ).rejects.toThrow(/already has paddle/);
    });
  });

  describe('removeUserSport', () => {
    it('should successfully delete existing sport', async () => {
      // Insert sport first
      await repository.addUserSport(testUserId, {
        sport_name: 'pickleball',
        skill_level: 'intermediate',
      });

      const result = await repository.removeUserSport(testUserId, 'pickleball');

      expect(result).toBe(true);

      // Verify deleted from database
      const dbRecord = await db('user_sports')
        .where({ user_id: testUserId, sport_name: 'pickleball' })
        .first();
      expect(dbRecord).toBeUndefined();
    });

    it('should return false when removing non-existent sport', async () => {
      const result = await repository.removeUserSport(testUserId, 'nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('getUserSports', () => {
    it('should return array of user sports ordered by creation time', async () => {
      // Insert multiple sports
      await repository.addUserSport(testUserId, {
        sport_name: 'pickleball',
        skill_level: 'intermediate',
        years_experience: 5,
      });

      await repository.addUserSport(testUserId, {
        sport_name: 'paddle',
        skill_level: 'beginner',
        years_experience: 1,
      });

      const sports = await repository.getUserSports(testUserId);

      expect(sports).toHaveLength(2);
      expect(sports[0].sport_name).toBe('pickleball');
      expect(sports[0].skill_level).toBe('intermediate');
      expect(sports[0].years_experience).toBe(5);
      expect(sports[1].sport_name).toBe('paddle');
      expect(sports[1].skill_level).toBe('beginner');
      expect(sports[1].years_experience).toBe(1);
    });

    it('should return empty array when user has no sports', async () => {
      const sports = await repository.getUserSports(testUserId);

      expect(sports).toEqual([]);
    });
  });
});
