/**
 * Integration tests for UserRepository.softDeleteUser - MVP test suite
 * Tests database-level soft delete with transaction handling and audit trail
 */

import { UserRepository } from '../../src/services/user-service/repositories/user.repository';
import { getTestDb, setupTestDb, cleanTestDb, teardownTestDb } from '../helpers/testDb';
import { Knex } from 'knex';

describe('UserRepository.softDeleteUser - MVP Integration Tests', () => {
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

  // Test 1: Successful soft delete sets status='inactive'
  it('should successfully soft delete user by setting status to inactive', async () => {
    // Arrange - create an active user
    const [user] = await db('users')
      .insert({
        email: 'delete1@example.com',
        username: 'deleteuser1',
        full_name: 'Delete User 1',
        password_hash: 'hash123',
        skill_level: 'intermediate',
        status: 'active',
      })
      .returning('*');

    // Verify user is initially active
    expect(user.status).toBe('active');

    // Act - soft delete the user
    const result = await userRepository.softDeleteUser(user.id);

    // Assert - operation succeeded
    expect(result).toBe(true);

    // Verify status was updated to inactive
    const deletedUser = await db('users')
      .select('id', 'status', 'email', 'username')
      .where({ id: user.id })
      .first();

    expect(deletedUser).toBeDefined();
    expect(deletedUser.status).toBe('inactive');
    // All other data should be preserved (no hard delete)
    expect(deletedUser.email).toBe('delete1@example.com');
    expect(deletedUser.username).toBe('deleteuser1');
  });

  // Test 2: Soft delete creates audit record
  it('should create audit trail record in deletion_audit table', async () => {
    // Arrange - create an active user
    const [user] = await db('users')
      .insert({
        email: 'delete2@example.com',
        username: 'deleteuser2',
        full_name: 'Delete User 2',
        password_hash: 'hash123',
        skill_level: 'advanced',
        status: 'active',
      })
      .returning('*');

    // Act - soft delete the user
    const result = await userRepository.softDeleteUser(user.id);

    // Assert - operation succeeded
    expect(result).toBe(true);

    // Verify audit record was created
    const auditRecord = await db('deletion_audit')
      .select('*')
      .where({ user_id: user.id })
      .first();

    expect(auditRecord).toBeDefined();
    expect(auditRecord.user_id).toBe(user.id);
    expect(auditRecord.deleted_at).toBeDefined();
    expect(auditRecord.deleted_by).toBeNull(); // No authenticated user context
  });

  // Test 3: Transaction rollback on error
  it('should rollback transaction if audit record creation fails', async () => {
    // Arrange - create an active user
    const [user] = await db('users')
      .insert({
        email: 'delete3@example.com',
        username: 'deleteuser3',
        full_name: 'Delete User 3',
        password_hash: 'hash123',
        skill_level: 'beginner',
        status: 'active',
      })
      .returning('*');

    // Temporarily drop the deletion_audit table to force an error
    await db.schema.dropTableIfExists('deletion_audit');

    // Act - attempt soft delete (should fail)
    const result = await userRepository.softDeleteUser(user.id);

    // Assert - operation failed
    expect(result).toBe(false);

    // Verify user status was NOT changed (transaction rolled back)
    const unchangedUser = await db('users')
      .select('status')
      .where({ id: user.id })
      .first();

    expect(unchangedUser.status).toBe('active');

    // Recreate the deletion_audit table for other tests
    await db.schema.createTable('deletion_audit', (table) => {
      table.increments('id').primary();
      table.integer('user_id').notNullable();
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.timestamp('deleted_at').notNullable().defaultTo(db.fn.now());
      table.integer('deleted_by').nullable();
      table.index('user_id');
      table.index('deleted_at');
    });
  });

  // Test 4: Idempotent delete (already deleted user)
  it('should be idempotent - return true for already deleted user', async () => {
    // Arrange - create an inactive user (already soft deleted)
    const [user] = await db('users')
      .insert({
        email: 'delete4@example.com',
        username: 'deleteuser4',
        full_name: 'Delete User 4',
        password_hash: 'hash123',
        skill_level: 'expert',
        status: 'inactive',
      })
      .returning('*');

    // Verify user is already inactive
    expect(user.status).toBe('inactive');

    // Act - attempt to soft delete already inactive user
    const result = await userRepository.softDeleteUser(user.id);

    // Assert - operation returns true (idempotent)
    expect(result).toBe(true);

    // Verify no duplicate audit records created
    const auditRecords = await db('deletion_audit')
      .select('*')
      .where({ user_id: user.id });

    expect(auditRecords).toHaveLength(0); // No audit record for already deleted user
  });

  // Additional edge case tests
  it('should return false for non-existent user ID', async () => {
    // Act - attempt to delete non-existent user
    const result = await userRepository.softDeleteUser(99999);

    // Assert
    expect(result).toBe(false);

    // Verify no audit record created
    const auditRecord = await db('deletion_audit')
      .select('*')
      .where({ user_id: 99999 })
      .first();

    expect(auditRecord).toBeUndefined();
  });

  it('should return false for invalid user ID (0)', async () => {
    // Act
    const result = await userRepository.softDeleteUser(0);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false for invalid user ID (negative)', async () => {
    // Act
    const result = await userRepository.softDeleteUser(-5);

    // Assert
    expect(result).toBe(false);
  });
});
