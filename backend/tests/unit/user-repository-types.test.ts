/**
 * Unit tests for TypeScript type correctness and interface compliance
 * Validates that repository methods return correct types
 */

import { UserRepository } from '../../src/services/user-service/repositories/user.repository';
import { UserWithSports, UserSport } from '../../src/shared/types/auth.types';
import { getTestDb, setupTestDb, cleanTestDb, teardownTestDb } from '../helpers/testDb';
import { Knex } from 'knex';

describe('UserRepository - TypeScript Type Correctness', () => {
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

  it('should return User type (without password_hash) or null from findById', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'typecheck@example.com',
        username: 'typecheckuser',
        full_name: 'Type Check User',
        password_hash: 'hash123',
        skill_level: 'intermediate',
        status: 'active',
      })
      .returning('*');

    // Act
    const result = await userRepository.findById(user.id);

    // Assert - type assertion should succeed
    expect(result).not.toBeNull();

    // Type check - these should not cause TypeScript errors
    const userId: number = result!.id;
    const userEmail: string = result!.email;
    const userStatus: 'active' | 'inactive' | 'suspended' = result!.status;

    expect(userId).toBeDefined();
    expect(userEmail).toBeDefined();
    expect(userStatus).toBeDefined();

    // Should not have password_hash
    expect((result as any).password_hash).toBeUndefined();
  });

  it('should have User.id as number (not string UUID)', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'idtype@example.com',
        username: 'idtypeuser',
        full_name: 'ID Type User',
        password_hash: 'hash123',
        skill_level: 'beginner',
        status: 'active',
      })
      .returning('*');

    // Act
    const result = await userRepository.findById(user.id);

    // Assert
    expect(result).not.toBeNull();

    // Validate id is number
    expect(typeof result!.id).toBe('number');
    expect(Number.isInteger(result!.id)).toBe(true);

    // Should NOT be UUID string
    expect(typeof result!.id).not.toBe('string');

    // Type assertion should work
    const idAsNumber: number = result!.id;
    expect(idAsNumber).toBeGreaterThan(0);
  });

  it('should have User.status as enum (not boolean)', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'statustype@example.com',
        username: 'statustypeuser',
        full_name: 'Status Type User',
        password_hash: 'hash123',
        skill_level: 'advanced',
        status: 'active',
      })
      .returning('*');

    // Act
    const result = await userRepository.findById(user.id);

    // Assert
    expect(result).not.toBeNull();

    // Validate status is string enum
    expect(typeof result!.status).toBe('string');
    expect(['active', 'inactive', 'suspended']).toContain(result!.status);

    // Should NOT be boolean
    expect(typeof result!.status).not.toBe('boolean');

    // Type assertion should work
    const status: 'active' | 'inactive' | 'suspended' = result!.status;
    expect(status).toBe('active');
  });

  it('should have sports array with correct interface: { sport_name, skill_level, years_experience?, preferred_position? }', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'sportstype@example.com',
        username: 'sportstypeuser',
        full_name: 'Sports Type User',
        password_hash: 'hash123',
        skill_level: 'expert',
        status: 'active',
      })
      .returning('*');

    await db('user_sports').insert({
      user_id: user.id,
      sport_name: 'pickleball',
      skill_level: 'expert',
      years_experience: 7,
      preferred_position: 'front',
    });

    // Act
    const result = await userRepository.getUserWithSports(user.id);

    // Assert
    expect(result).not.toBeNull();

    // Type assertion should work for UserWithSports
    const userWithSports: UserWithSports = result!;
    expect(userWithSports.sports).toBeDefined();

    // Validate sports array structure
    expect(Array.isArray(userWithSports.sports)).toBe(true);
    expect(userWithSports.sports).toHaveLength(1);

    // Type assertion should work for UserSport
    const sport: UserSport = userWithSports.sports[0];

    // Check required fields
    expect(sport.sport_name).toBeDefined();
    expect(typeof sport.sport_name).toBe('string');

    expect(sport.skill_level).toBeDefined();
    expect(['beginner', 'intermediate', 'advanced', 'expert']).toContain(sport.skill_level);

    // Check optional fields
    expect(sport.years_experience).toBeDefined();
    expect(typeof sport.years_experience).toBe('number');

    expect(sport.preferred_position).toBeDefined();
    expect(typeof sport.preferred_position).toBe('string');
  });
});
