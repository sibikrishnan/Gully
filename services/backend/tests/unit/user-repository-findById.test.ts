/**
 * Unit tests for UserRepository.findById - basic functionality
 * Tests valid integer IDs, non-existent IDs, password exclusion, and type correctness
 */

import { UserRepository } from '../../src/services/user-service/repositories/user.repository';
import { getTestDb, setupTestDb, cleanTestDb, teardownTestDb } from '../helpers/testDb';
import { createTestUser } from '../helpers/fixtures';
import { Knex } from 'knex';

describe('UserRepository.findById - Basic Functionality', () => {
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

  describe('Valid User ID', () => {
    it('should return user object with all fields except password_hash for valid ID', async () => {
      // Arrange
      const testUser = await createTestUser(db, {
        email: 'test1@example.com',
        username: 'testuser1',
        full_name: 'Test User One',
      });

      // Act
      const result = await userRepository.findById(testUser.id);

      // Assert
      expect(result).not.toBeNull();
      expect(result).toBeDefined();
      expect(result!.id).toBe(testUser.id);
      expect(result!.email).toBe('test1@example.com');
      expect(result!.username).toBe('testuser1');
      expect(result!.full_name).toBe('Test User One');
      expect(result!.status).toBe('active');
      expect(result!.skill_level).toBeDefined();
      expect(result!.created_at).toBeDefined();
      expect(result!.updated_at).toBeDefined();

      // Verify password_hash is NOT included
      expect((result as any).password_hash).toBeUndefined();
    });

    it('should exclude password_hash from returned user object', async () => {
      // Arrange
      const testUser = await createTestUser(db);

      // Act
      const result = await userRepository.findById(testUser.id);

      // Assert
      expect(result).not.toBeNull();
      expect(Object.keys(result!)).not.toContain('password_hash');
      expect((result as any).password_hash).toBeUndefined();
    });

    it('should return user with correct TypeScript types (id: number, status: enum)', async () => {
      // Arrange
      const testUser = await createTestUser(db);

      // Act
      const result = await userRepository.findById(testUser.id);

      // Assert
      expect(result).not.toBeNull();

      // Validate ID is number (not UUID string)
      expect(typeof result!.id).toBe('number');
      expect(Number.isInteger(result!.id)).toBe(true);

      // Validate status is enum value
      expect(result!.status).toBe('active');
      expect(['active', 'inactive', 'suspended']).toContain(result!.status);
    });
  });

  describe('Non-existent User ID', () => {
    it('should return null for non-existent user ID', async () => {
      // Arrange
      const nonExistentId = 999999;

      // Act
      const result = await userRepository.findById(nonExistentId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Invalid ID Edge Cases', () => {
    it('should return null for ID = 0 (invalid ID)', async () => {
      // Act
      const result = await userRepository.findById(0);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for negative ID', async () => {
      // Act
      const result = await userRepository.findById(-1);

      // Assert
      expect(result).toBeNull();
    });
  });
});
