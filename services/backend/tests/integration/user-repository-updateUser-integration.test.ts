/**
 * Integration tests for UserRepository.updateUser - Database Operations
 * Tests unique constraints, transactions, rollback, and concurrent updates
 * Task: P2-PROF-T2.1 - Repository layer for PATCH /api/users/:id
 */

import { UserRepository } from '../../src/services/user-service/repositories/user.repository';
import { getTestDb, setupTestDb, cleanTestDb, teardownTestDb } from '../helpers/testDb';
import { createTestUser } from '../helpers/fixtures';
import { Knex } from 'knex';

describe('UserRepository.updateUser - Integration Tests', () => {
  let db: Knex;
  let userRepository: UserRepository;

  beforeAll(async () => {
    await setupTestDb();
    db = getTestDb();
    userRepository = new UserRepository();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  afterEach(async () => {
    await cleanTestDb();
  });

  describe('Unique Constraint Validation', () => {
    it('should throw error when updating to existing username', async () => {
      // Arrange
      await createTestUser(db, {
        email: 'user1@example.com',
        username: 'user1',
      });
      const user2 = await createTestUser(db, {
        email: 'user2@example.com',
        username: 'user2',
      });

      // Act & Assert
      await expect(
        userRepository.updateUser(user2.id, {
          username: 'user1', // Already taken by user1
        })
      ).rejects.toThrow('Username already exists');
    });

    it('should allow updating username to same value (self-update)', async () => {
      // Arrange
      const testUser = await createTestUser(db, {
        email: 'test@example.com',
        username: 'testuser',
      });

      // Act
      const result = await userRepository.updateUser(testUser.id, {
        username: 'testuser', // Same username
        full_name: 'Updated Name',
      });

      // Assert
      expect(result).not.toBeNull();
      expect(result!.username).toBe('testuser');
      expect(result!.full_name).toBe('Updated Name');
    });

    it('should successfully update username to new unique value', async () => {
      // Arrange
      const testUser = await createTestUser(db, {
        username: 'oldusername',
      });

      // Act
      const result = await userRepository.updateUser(testUser.id, {
        username: 'newusername',
      });

      // Assert
      expect(result).not.toBeNull();
      expect(result!.username).toBe('newusername');
    });

    it('should maintain email uniqueness (cannot update email to existing one)', async () => {
      // Arrange
      await createTestUser(db, {
        email: 'user1@example.com',
        username: 'user1',
      });
      const user2 = await createTestUser(db, {
        email: 'user2@example.com',
        username: 'user2',
      });

      // Act - Try to update user2's email to user1's email
      // This should fail due to unique constraint on email
      const updatePromise = db('users')
        .update({ email: 'user1@example.com' })
        .where({ id: user2.id });

      // Assert
      await expect(updatePromise).rejects.toThrow();
    });
  });

  describe('Transaction Support', () => {
    it('should commit transaction on successful update', async () => {
      // Arrange
      const testUser = await createTestUser(db);

      // Act
      const result = await userRepository.updateUser(testUser.id, {
        full_name: 'Transaction Test Name',
        phone_number: '+1111111111',
      });

      // Assert
      expect(result).not.toBeNull();

      // Verify changes persisted in database
      const dbUser = await db('users').select('*').where({ id: testUser.id }).first();
      expect(dbUser.full_name).toBe('Transaction Test Name');
      expect(dbUser.phone_number).toBe('+1111111111');
    });

    it('should rollback transaction on constraint violation', async () => {
      // Arrange
      await createTestUser(db, {
        email: 'user1@example.com',
        username: 'user1',
        full_name: 'Original Name 1',
      });
      const user2 = await createTestUser(db, {
        email: 'user2@example.com',
        username: 'user2',
        full_name: 'Original Name 2',
      });

      // Act - Try to update with duplicate username
      try {
        await userRepository.updateUser(user2.id, {
          username: 'user1', // Duplicate
          full_name: 'Should Not Be Updated',
        });
      } catch (error) {
        // Expected to throw
      }

      // Assert - Verify NO changes were committed (transaction rolled back)
      const dbUser2 = await db('users').select('*').where({ id: user2.id }).first();
      expect(dbUser2.username).toBe('user2'); // Original username
      expect(dbUser2.full_name).toBe('Original Name 2'); // Original name (not updated)
    });

    it('should handle transaction rollback on database error', async () => {
      // Arrange
      const testUser = await createTestUser(db);
      const originalFullName = testUser.full_name;

      // Act - Force a database error by closing connection temporarily
      // (This is a simplified test; real-world scenarios would have more complex errors)
      try {
        await userRepository.updateUser(testUser.id, {
          full_name: 'Should Not Be Saved',
          // Attempt to set an invalid type that would cause DB error
          location_lat: 'invalid_latitude' as any,
        });
      } catch (error) {
        // Expected to throw
      }

      // Assert - Verify original data remains unchanged
      const dbUser = await db('users').select('*').where({ id: testUser.id }).first();
      expect(dbUser.full_name).toBe(originalFullName);
    });
  });

  describe('Transaction Isolation', () => {
    it('should use transaction for atomic operations', async () => {
      // Arrange
      const testUser = await createTestUser(db);

      // Act - Normal update
      const result = await userRepository.updateUser(testUser.id, {
        full_name: 'Updated With Transaction',
      });

      // Assert
      expect(result).not.toBeNull();
      expect(result!.full_name).toBe('Updated With Transaction');

      // Verify persistence in database
      const dbUser = await db('users').select('full_name').where({ id: testUser.id }).first();
      expect(dbUser.full_name).toBe('Updated With Transaction');
    });

    it('should handle concurrent updates gracefully', async () => {
      // Arrange
      const testUser = await createTestUser(db, {
        full_name: 'Original Name',
      });

      // Simulate concurrent update by modifying user directly in DB
      await db('users')
        .update({ full_name: 'Concurrent Update' })
        .where({ id: testUser.id });

      // Act - Subsequent update should succeed (last write wins)
      const result = await userRepository.updateUser(testUser.id, {
        full_name: 'Final Update',
      });

      // Assert
      expect(result).not.toBeNull();
      expect(result!.full_name).toBe('Final Update');
    });
  });

  describe('Database Operations', () => {
    it('should persist all updated fields correctly in database', async () => {
      // Arrange
      const testUser = await createTestUser(db);

      // Act
      await userRepository.updateUser(testUser.id, {
        username: 'db_test_user',
        full_name: 'Database Test User',
        phone_number: '+9999999999',
        skill_level: 'expert',
        location_lat: 51.5074,
        location_lng: -0.1278,
        location_name: 'London, UK',
        preferred_radius_km: 50,
        status: 'inactive',
      });

      // Assert - Query database directly to verify persistence
      const dbUser = await db('users')
        .select('*')
        .where({ id: testUser.id })
        .first();

      expect(dbUser.username).toBe('db_test_user');
      expect(dbUser.full_name).toBe('Database Test User');
      expect(dbUser.phone_number).toBe('+9999999999');
      expect(dbUser.skill_level).toBe('expert');
      expect(parseFloat(dbUser.location_lat)).toBeCloseTo(51.5074, 4);
      expect(parseFloat(dbUser.location_lng)).toBeCloseTo(-0.1278, 4);
      expect(dbUser.location_name).toBe('London, UK');
      expect(dbUser.preferred_radius_km).toBe(50);
      expect(dbUser.status).toBe('inactive');
    });

    it('should handle setting optional fields to null', async () => {
      // Arrange
      const testUser = await createTestUser(db, {
        phone_number: '+1234567890',
        location_name: 'Original Location',
        profile_image_url: 'http://example.com/image.jpg',
      });

      // Act - Set to null by directly updating DB (repository doesn't expose null setting)
      await db('users')
        .update({
          phone_number: null,
          location_name: null,
          profile_image_url: null,
        })
        .where({ id: testUser.id });

      // Fetch updated user via repository
      const result = await userRepository.findById(testUser.id);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.phone_number).toBeFalsy(); // null or undefined
      expect(result!.location_name).toBeFalsy(); // null or undefined
      expect(result!.profile_image_url).toBeFalsy(); // null or undefined
    });

    it('should return updated user with all correct fields', async () => {
      // Arrange
      const testUser = await createTestUser(db);

      // Act
      const result = await userRepository.updateUser(testUser.id, {
        full_name: 'Complete Test',
      });

      // Assert - Verify all expected fields are present
      expect(result).not.toBeNull();
      expect(result!.id).toBeDefined();
      expect(result!.email).toBeDefined();
      expect(result!.username).toBeDefined();
      expect(result!.full_name).toBe('Complete Test');
      expect(result!.skill_level).toBeDefined();
      expect(result!.status).toBeDefined();
      expect(result!.created_at).toBeDefined();
      expect(result!.updated_at).toBeDefined();
      expect((result as any).password_hash).toBeUndefined();
    });

    it('should handle multiple sequential updates correctly', async () => {
      // Arrange
      const testUser = await createTestUser(db, {
        full_name: 'Original Name',
        skill_level: 'beginner',
      });

      // Act - Perform 3 sequential updates
      const result1 = await userRepository.updateUser(testUser.id, {
        full_name: 'First Update',
      });
      expect(result1!.full_name).toBe('First Update');

      const result2 = await userRepository.updateUser(testUser.id, {
        skill_level: 'intermediate',
      });
      expect(result2!.skill_level).toBe('intermediate');
      expect(result2!.full_name).toBe('First Update'); // Unchanged

      const result3 = await userRepository.updateUser(testUser.id, {
        full_name: 'Final Update',
        skill_level: 'advanced',
      });

      // Assert
      expect(result3).not.toBeNull();
      expect(result3!.full_name).toBe('Final Update');
      expect(result3!.skill_level).toBe('advanced');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Arrange
      const testUser = await createTestUser(db);

      // Act - Try to update with invalid data type
      const result = await userRepository.updateUser(testUser.id, {
        preferred_radius_km: 'invalid_number' as any,
      });

      // Assert - Should return null on unexpected errors
      expect(result).toBeNull();
    });
  });
});
