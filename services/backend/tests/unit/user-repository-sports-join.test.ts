/**
 * Unit tests for UserRepository.getUserWithSports - JOIN logic
 * Tests LEFT JOIN with user_sports table, empty sports arrays, multiple sports
 * Validates INTEGER user_id foreign key
 */

import { UserRepository } from '../../src/services/user-service/repositories/user.repository';
import { getTestDb, setupTestDb, cleanTestDb, teardownTestDb } from '../helpers/testDb';
import { Knex } from 'knex';

describe('UserRepository.getUserWithSports - JOIN Logic', () => {
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

  it('should return user with empty sports array when user has no sports', async () => {
    // Arrange - create user with no sports
    const [user] = await db('users')
      .insert({
        email: 'nosports@example.com',
        username: 'nosportsuser',
        full_name: 'No Sports User',
        password_hash: 'hash123',
        skill_level: 'beginner',
        status: 'active',
      })
      .returning('*');

    // Act
    const result = await userRepository.getUserWithSports(user.id);

    // Assert
    expect(result).not.toBeNull();
    expect(result!.id).toBe(user.id);
    expect(result!.email).toBe('nosports@example.com');
    expect(result!.sports).toBeDefined();
    expect(Array.isArray(result!.sports)).toBe(true);
    expect(result!.sports).toHaveLength(0);
  });

  it('should return user with single sport (pickleball with skill_level="intermediate")', async () => {
    // Arrange - create user
    const [user] = await db('users')
      .insert({
        email: 'singlesport@example.com',
        username: 'singlesportuser',
        full_name: 'Single Sport User',
        password_hash: 'hash123',
        skill_level: 'intermediate',
        status: 'active',
      })
      .returning('*');

    // Add sport
    await db('user_sports').insert({
      user_id: user.id,
      sport_name: 'pickleball',
      skill_level: 'intermediate',
      years_experience: 2,
      preferred_position: 'any',
    });

    // Act
    const result = await userRepository.getUserWithSports(user.id);

    // Assert
    expect(result).not.toBeNull();
    expect(result!.sports).toHaveLength(1);
    expect(result!.sports[0].sport_name).toBe('pickleball');
    expect(result!.sports[0].skill_level).toBe('intermediate');
    expect(result!.sports[0].years_experience).toBe(2);
    expect(result!.sports[0].preferred_position).toBe('any');
  });

  it('should return user with multiple sports (pickleball + paddle)', async () => {
    // Arrange - create user
    const [user] = await db('users')
      .insert({
        email: 'multisport@example.com',
        username: 'multisportuser',
        full_name: 'Multi Sport User',
        password_hash: 'hash123',
        skill_level: 'advanced',
        status: 'active',
      })
      .returning('*');

    // Add multiple sports
    await db('user_sports').insert([
      {
        user_id: user.id,
        sport_name: 'pickleball',
        skill_level: 'advanced',
        years_experience: 5,
        preferred_position: 'front',
      },
      {
        user_id: user.id,
        sport_name: 'paddle',
        skill_level: 'intermediate',
        years_experience: 3,
        preferred_position: 'back',
      },
    ]);

    // Act
    const result = await userRepository.getUserWithSports(user.id);

    // Assert
    expect(result).not.toBeNull();
    expect(result!.sports).toHaveLength(2);

    // Check both sports exist
    const sportNames = result!.sports.map((s) => s.sport_name);
    expect(sportNames).toContain('pickleball');
    expect(sportNames).toContain('paddle');

    // Find each sport and verify
    const pickleball = result!.sports.find((s) => s.sport_name === 'pickleball');
    expect(pickleball).toBeDefined();
    expect(pickleball!.skill_level).toBe('advanced');
    expect(pickleball!.years_experience).toBe(5);

    const paddle = result!.sports.find((s) => s.sport_name === 'paddle');
    expect(paddle).toBeDefined();
    expect(paddle!.skill_level).toBe('intermediate');
    expect(paddle!.years_experience).toBe(3);
  });

  it('should include all sport fields: sport_name, skill_level, years_experience, preferred_position', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'allfields@example.com',
        username: 'allfieldsuser',
        full_name: 'All Fields User',
        password_hash: 'hash123',
        skill_level: 'expert',
        status: 'active',
      })
      .returning('*');

    await db('user_sports').insert({
      user_id: user.id,
      sport_name: 'pickleball',
      skill_level: 'expert',
      years_experience: 10,
      preferred_position: 'server',
    });

    // Act
    const result = await userRepository.getUserWithSports(user.id);

    // Assert
    expect(result).not.toBeNull();
    expect(result!.sports).toHaveLength(1);

    const sport = result!.sports[0];
    expect(sport).toHaveProperty('sport_name');
    expect(sport).toHaveProperty('skill_level');
    expect(sport).toHaveProperty('years_experience');
    expect(sport).toHaveProperty('preferred_position');

    expect(sport.sport_name).toBe('pickleball');
    expect(sport.skill_level).toBe('expert');
    expect(sport.years_experience).toBe(10);
    expect(sport.preferred_position).toBe('server');
  });

  it('should use INTEGER user_id foreign key (not UUID)', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'integerid@example.com',
        username: 'integeriduser',
        full_name: 'Integer ID User',
        password_hash: 'hash123',
        skill_level: 'beginner',
        status: 'active',
      })
      .returning('*');

    // Verify user.id is an integer
    expect(typeof user.id).toBe('number');
    expect(Number.isInteger(user.id)).toBe(true);

    // Add sport with integer user_id
    await db('user_sports').insert({
      user_id: user.id, // INTEGER FK
      sport_name: 'pickleball',
      skill_level: 'beginner',
    });

    // Act
    const result = await userRepository.getUserWithSports(user.id);

    // Assert
    expect(result).not.toBeNull();
    expect(typeof result!.id).toBe('number');
    expect(Number.isInteger(result!.id)).toBe(true);
    expect(result!.sports).toHaveLength(1);
  });

  it('should handle user_sports table structure matching migration (user_id FK, sport_name, skill_level enum)', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'schema@example.com',
        username: 'schemauser',
        full_name: 'Schema User',
        password_hash: 'hash123',
        skill_level: 'intermediate',
        status: 'active',
      })
      .returning('*');

    // Insert using exact migration schema
    await db('user_sports').insert({
      user_id: user.id, // INTEGER FK to users.id
      sport_name: 'pickleball', // VARCHAR(50)
      skill_level: 'intermediate', // ENUM
      years_experience: 3, // INTEGER (nullable)
      preferred_position: 'center', // VARCHAR(50) (nullable)
    });

    // Act
    const result = await userRepository.getUserWithSports(user.id);

    // Assert
    expect(result).not.toBeNull();
    expect(result!.sports).toHaveLength(1);

    const sport = result!.sports[0];
    expect(sport.sport_name).toBe('pickleball');
    expect(['beginner', 'intermediate', 'advanced', 'expert']).toContain(sport.skill_level);
    expect(typeof sport.years_experience).toBe('number');
    expect(typeof sport.preferred_position).toBe('string');
  });
});
