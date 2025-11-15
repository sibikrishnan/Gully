/**
 * Integration tests for user_sports JOIN query performance
 * Tests must complete within 100ms
 */

import { UserRepository } from '../../src/services/user-service/repositories/user.repository';
import { getTestDb, setupTestDb, cleanTestDb, teardownTestDb } from '../helpers/testDb';
import { Knex } from 'knex';

describe('UserRepository - JOIN Performance (Integration)', () => {
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

  it('should complete getUserWithSports in <100ms for user with 0 sports', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'perf0@example.com',
        username: 'perf0user',
        full_name: 'Performance 0 User',
        password_hash: 'hash123',
        skill_level: 'beginner',
        status: 'active',
      })
      .returning('*');

    // Act
    const startTime = Date.now();
    const result = await userRepository.getUserWithSports(user.id);
    const duration = Date.now() - startTime;

    // Assert
    expect(result).not.toBeNull();
    expect(result!.sports).toHaveLength(0);
    expect(duration).toBeLessThan(100); // Must complete in <100ms
  });

  it('should complete getUserWithSports in <100ms for user with 3 sports', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'perf3@example.com',
        username: 'perf3user',
        full_name: 'Performance 3 User',
        password_hash: 'hash123',
        skill_level: 'advanced',
        status: 'active',
      })
      .returning('*');

    await db('user_sports').insert([
      { user_id: user.id, sport_name: 'pickleball', skill_level: 'advanced' },
      { user_id: user.id, sport_name: 'paddle', skill_level: 'intermediate' },
      { user_id: user.id, sport_name: 'tennis', skill_level: 'beginner' },
    ]);

    // Act
    const startTime = Date.now();
    const result = await userRepository.getUserWithSports(user.id);
    const duration = Date.now() - startTime;

    // Assert
    expect(result).not.toBeNull();
    expect(result!.sports).toHaveLength(3);
    expect(duration).toBeLessThan(100); // Must complete in <100ms
  });

  it('should use index on user_sports.user_id (validate with EXPLAIN)', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'index@example.com',
        username: 'indexuser',
        full_name: 'Index User',
        password_hash: 'hash123',
        skill_level: 'intermediate',
        status: 'active',
      })
      .returning('*');

    await db('user_sports').insert({
      user_id: user.id,
      sport_name: 'pickleball',
      skill_level: 'intermediate',
    });

    // Act - EXPLAIN the query
    const explainResult = await db.raw(`
      EXPLAIN (FORMAT JSON)
      SELECT sport_name, skill_level, years_experience, preferred_position
      FROM user_sports
      WHERE user_id = ?
      ORDER BY created_at ASC
    `, [user.id]);

    // Assert - check if index is used
    const explainJson = JSON.stringify(explainResult.rows[0]);
    expect(explainJson).toContain('Index'); // Should use index on user_id
  });
});
