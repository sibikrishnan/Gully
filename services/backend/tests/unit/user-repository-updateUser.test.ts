/**
 * Unit tests for UserRepository.updateUser - PATCH operation
 * Tests partial updates, immutable field protection, constraint validation, and error handling
 * Task: P2-PROF-T2.1 - Repository layer for PATCH /api/users/:id
 */

import { UserRepository } from '../../src/services/user-service/repositories/user.repository';
import { getTestDb, setupTestDb, cleanTestDb, teardownTestDb } from '../helpers/testDb';
import { createTestUser } from '../helpers/fixtures';
import { Knex } from 'knex';

describe('UserRepository.updateUser - Unit Tests', () => {
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

  describe('Partial Field Updates', () => {
    it('should update only username field when only username is provided', async () => {
      // Arrange
      const testUser = await createTestUser(db, {
        email: 'original@example.com',
        username: 'original_user',
        full_name: 'Original Name',
      });

      // Act
      const result = await userRepository.updateUser(testUser.id, {
        username: 'updated_user',
      });

      // Assert
      expect(result).not.toBeNull();
      expect(result!.username).toBe('updated_user');
      expect(result!.email).toBe('original@example.com'); // Unchanged
      expect(result!.full_name).toBe('Original Name'); // Unchanged
    });

    it('should update multiple fields simultaneously', async () => {
      // Arrange
      const testUser = await createTestUser(db);

      // Act
      const result = await userRepository.updateUser(testUser.id, {
        full_name: 'Updated Name',
        phone_number: '+9876543210',
        skill_level: 'advanced',
      });

      // Assert
      expect(result).not.toBeNull();
      expect(result!.full_name).toBe('Updated Name');
      expect(result!.phone_number).toBe('+9876543210');
      expect(result!.skill_level).toBe('advanced');
    });

    it('should update location fields correctly', async () => {
      // Arrange
      const testUser = await createTestUser(db);

      // Act
      const result = await userRepository.updateUser(testUser.id, {
        location_lat: 34.0522,
        location_lng: -118.2437,
        location_name: 'Los Angeles, CA',
        preferred_radius_km: 25,
      });

      // Assert
      expect(result).not.toBeNull();
      expect(parseFloat(result!.location_lat as any)).toBeCloseTo(34.0522, 4);
      expect(parseFloat(result!.location_lng as any)).toBeCloseTo(-118.2437, 4);
      expect(result!.location_name).toBe('Los Angeles, CA');
      expect(result!.preferred_radius_km).toBe(25);
    });
  });

  describe('Immutable Field Protection', () => {
    it('should not update id field even if provided', async () => {
      // Arrange
      const testUser = await createTestUser(db);
      const originalId = testUser.id;

      // Act
      const result = await userRepository.updateUser(testUser.id, {
        id: 99999, // Attempt to change ID
        full_name: 'Updated Name',
      } as any);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.id).toBe(originalId); // ID should remain unchanged
      expect(result!.full_name).toBe('Updated Name');
    });

    it('should not update password_hash field even if provided', async () => {
      // Arrange
      const testUser = await createTestUser(db);
      const originalPasswordHash = (await db('users').select('password_hash').where({ id: testUser.id }).first())!.password_hash;

      // Act
      const result = await userRepository.updateUser(testUser.id, {
        password_hash: 'malicious_hash',
        full_name: 'Updated Name',
      } as any);

      // Assert
      expect(result).not.toBeNull();
      const updatedPasswordHash = (await db('users').select('password_hash').where({ id: testUser.id }).first())!.password_hash;
      expect(updatedPasswordHash).toBe(originalPasswordHash); // Password hash unchanged
      expect(result!.full_name).toBe('Updated Name');
    });

    it('should not update created_at field even if provided', async () => {
      // Arrange
      const testUser = await createTestUser(db);
      const originalCreatedAt = testUser.created_at;

      // Act
      const result = await userRepository.updateUser(testUser.id, {
        created_at: new Date('2020-01-01'),
        full_name: 'Updated Name',
      } as any);

      // Assert
      expect(result).not.toBeNull();
      expect(new Date(result!.created_at).getTime()).toBe(new Date(originalCreatedAt).getTime());
      expect(result!.full_name).toBe('Updated Name');
    });
  });

  describe('ENUM Field Validation', () => {
    it('should successfully update status to valid enum value', async () => {
      // Arrange
      const testUser = await createTestUser(db);

      // Act
      const result = await userRepository.updateUser(testUser.id, {
        status: 'inactive',
      });

      // Assert
      expect(result).not.toBeNull();
      expect(result!.status).toBe('inactive');
    });

    it('should throw error for invalid status value', async () => {
      // Arrange
      const testUser = await createTestUser(db);

      // Act & Assert
      await expect(
        userRepository.updateUser(testUser.id, {
          status: 'invalid_status' as any,
        })
      ).rejects.toThrow('Invalid status value');
    });

    it('should successfully update skill_level to valid enum value', async () => {
      // Arrange
      const testUser = await createTestUser(db, { skill_level: 'beginner' });

      // Act
      const result = await userRepository.updateUser(testUser.id, {
        skill_level: 'expert',
      });

      // Assert
      expect(result).not.toBeNull();
      expect(result!.skill_level).toBe('expert');
    });

    it('should throw error for invalid skill_level value', async () => {
      // Arrange
      const testUser = await createTestUser(db);

      // Act & Assert
      await expect(
        userRepository.updateUser(testUser.id, {
          skill_level: 'master' as any,
        })
      ).rejects.toThrow('Invalid skill_level value');
    });
  });

  describe('Input Validation', () => {
    it('should return null for invalid user ID (zero)', async () => {
      // Act
      const result = await userRepository.updateUser(0, {
        full_name: 'Updated Name',
      });

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for negative user ID', async () => {
      // Act
      const result = await userRepository.updateUser(-1, {
        full_name: 'Updated Name',
      });

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for empty updates object', async () => {
      // Arrange
      const testUser = await createTestUser(db);

      // Act
      const result = await userRepository.updateUser(testUser.id, {});

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for non-existent user ID', async () => {
      // Act
      const result = await userRepository.updateUser(99999, {
        full_name: 'Updated Name',
      });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Auto-updating Timestamp', () => {
    it('should automatically update updated_at timestamp on update', async () => {
      // Arrange
      const testUser = await createTestUser(db);
      const originalUpdatedAt = testUser.updated_at;

      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // Act
      const result = await userRepository.updateUser(testUser.id, {
        full_name: 'Updated Name',
      });

      // Assert
      expect(result).not.toBeNull();
      expect(new Date(result!.updated_at).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
    });
  });

  describe('Password Hash Exclusion', () => {
    it('should not return password_hash in result', async () => {
      // Arrange
      const testUser = await createTestUser(db);

      // Act
      const result = await userRepository.updateUser(testUser.id, {
        full_name: 'Updated Name',
      });

      // Assert
      expect(result).not.toBeNull();
      expect((result as any).password_hash).toBeUndefined();
    });
  });
});
