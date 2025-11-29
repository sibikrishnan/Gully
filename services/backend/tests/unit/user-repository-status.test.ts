/**
 * Unit tests for UserRepository.findById - status field validation
 * Tests active/inactive/suspended status handling
 * Validates ENUM status field (not boolean is_active)
 */

import { UserRepository } from '../../src/services/user-service/repositories/user.repository';
import { getTestDb, setupTestDb, cleanTestDb, teardownTestDb } from '../helpers/testDb';
import { Knex } from 'knex';

describe('UserRepository.findById - Status Field Validation', () => {
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

  it('should return user with status="active"', async () => {
    // Arrange - create active user
    const [user] = await db('users')
      .insert({
        email: 'active@example.com',
        username: 'activeuser',
        full_name: 'Active User',
        password_hash: 'hash123',
        skill_level: 'intermediate',
        status: 'active',
      })
      .returning('*');

    // Act
    const result = await userRepository.findById(user.id);

    // Assert
    expect(result).not.toBeNull();
    expect(result!.status).toBe('active');
  });

  it('should NOT return user with status="inactive" (soft-deleted)', async () => {
    // Arrange - create inactive user
    const [user] = await db('users')
      .insert({
        email: 'inactive@example.com',
        username: 'inactiveuser',
        full_name: 'Inactive User',
        password_hash: 'hash123',
        skill_level: 'intermediate',
        status: 'inactive',
      })
      .returning('*');

    // Act
    const result = await userRepository.findById(user.id);

    // Assert
    expect(result).toBeNull();
  });

  it('should NOT return user with status="suspended"', async () => {
    // Arrange - create suspended user
    const [user] = await db('users')
      .insert({
        email: 'suspended@example.com',
        username: 'suspendeduser',
        full_name: 'Suspended User',
        password_hash: 'hash123',
        skill_level: 'intermediate',
        status: 'suspended',
      })
      .returning('*');

    // Act
    const result = await userRepository.findById(user.id);

    // Assert
    expect(result).toBeNull();
  });

  it('should validate status field uses ENUM values (not boolean is_active)', async () => {
    // Arrange - create active user
    const [user] = await db('users')
      .insert({
        email: 'enum@example.com',
        username: 'enumuser',
        full_name: 'Enum User',
        password_hash: 'hash123',
        skill_level: 'intermediate',
        status: 'active',
      })
      .returning('*');

    // Act
    const result = await userRepository.findById(user.id);

    // Assert
    expect(result).not.toBeNull();

    // Verify status is a string enum, not a boolean
    expect(typeof result!.status).toBe('string');
    expect(['active', 'inactive', 'suspended']).toContain(result!.status);

    // Ensure it's not a boolean field
    expect(typeof result!.status).not.toBe('boolean');
    expect((result as any).is_active).toBeUndefined();
  });
});
