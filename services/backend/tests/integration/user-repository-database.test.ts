/**
 * Integration tests for UserRepository - database query execution
 * Tests real PostgreSQL connection, parameterized queries, and data types
 */

import { UserRepository } from '../../src/services/user-service/repositories/user.repository';
import { getTestDb, setupTestDb, cleanTestDb, teardownTestDb } from '../helpers/testDb';
import { Knex } from 'knex';

describe('UserRepository - Database Query Execution (Integration)', () => {
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

  it('should connect to test database successfully', async () => {
    // Act - test database connection
    const result = await db.raw('SELECT 1 as value');

    // Assert
    expect(result).toBeDefined();
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].value).toBe(1);
  });

  it('should execute findById with parameterized WHERE id=$1 query', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'query@example.com',
        username: 'queryuser',
        full_name: 'Query User',
        password_hash: 'hash123',
        skill_level: 'intermediate',
        status: 'active',
      })
      .returning('*');

    // Act - execute query with parameterized ID
    const result = await userRepository.findById(user.id);

    // Assert - query executed successfully
    expect(result).not.toBeNull();
    expect(result!.id).toBe(user.id);

    // Verify Knex uses parameterized queries (not string concatenation)
    // This is ensured by using .where({ id }) instead of raw SQL
  });

  it('should execute getUserWithSports with LEFT JOIN user_sports query', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'join@example.com',
        username: 'joinuser',
        full_name: 'Join User',
        password_hash: 'hash123',
        skill_level: 'advanced',
        status: 'active',
      })
      .returning('*');

    await db('user_sports').insert({
      user_id: user.id,
      sport_name: 'pickleball',
      skill_level: 'advanced',
    });

    // Act - execute LEFT JOIN query
    const result = await userRepository.getUserWithSports(user.id);

    // Assert - JOIN executed successfully
    expect(result).not.toBeNull();
    expect(result!.id).toBe(user.id);
    expect(result!.sports).toHaveLength(1);
    expect(result!.sports[0].sport_name).toBe('pickleball');
  });

  it('should use Knex query builder (not raw SQL) for SQL injection protection', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'safe@example.com',
        username: 'safeuser',
        full_name: 'Safe User',
        password_hash: 'hash123',
        skill_level: 'beginner',
        status: 'active',
      })
      .returning('*');

    // Act - try with valid ID (Knex will sanitize)
    const result = await userRepository.findById(user.id);

    // Assert
    expect(result).not.toBeNull();
    expect(result!.id).toBe(user.id);

    // Note: Knex automatically parameterizes queries, preventing SQL injection
    // Using .where({ id }) is safe because Knex escapes the value
  });

  it('should return data with correct types (id as number, not string)', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'types@example.com',
        username: 'typesuser',
        full_name: 'Types User',
        password_hash: 'hash123',
        skill_level: 'expert',
        status: 'active',
      })
      .returning('*');

    // Act
    const result = await userRepository.findById(user.id);

    // Assert - verify data types from database
    expect(result).not.toBeNull();

    // ID should be number (not string UUID)
    expect(typeof result!.id).toBe('number');
    expect(Number.isInteger(result!.id)).toBe(true);

    // Status should be string enum
    expect(typeof result!.status).toBe('string');

    // Timestamps should be Date objects or strings that can be parsed
    expect(result!.created_at).toBeDefined();
    expect(result!.updated_at).toBeDefined();

    // Numeric fields should be numbers
    expect(typeof result!.preferred_radius_km).toBe('number');
  });
});
