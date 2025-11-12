/**
 * Integration tests for data consistency between users and user_sports tables
 * Tests LEFT JOIN behavior, ordering, and foreign key constraints
 */

import { UserRepository } from '../../src/services/user-service/repositories/user.repository';
import { getTestDb, setupTestDb, cleanTestDb, teardownTestDb } from '../helpers/testDb';
import { Knex } from 'knex';

describe('UserRepository - Data Consistency (Integration)', () => {
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

  it('should return sports sorted by created_at ASC (oldest first)', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'ordering@example.com',
        username: 'orderinguser',
        full_name: 'Ordering User',
        password_hash: 'hash123',
        skill_level: 'intermediate',
        status: 'active',
      })
      .returning('*');

    // Insert sports with delays to ensure different created_at times
    await db('user_sports').insert({
      user_id: user.id,
      sport_name: 'first_sport',
      skill_level: 'beginner',
    });

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db('user_sports').insert({
      user_id: user.id,
      sport_name: 'second_sport',
      skill_level: 'intermediate',
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    await db('user_sports').insert({
      user_id: user.id,
      sport_name: 'third_sport',
      skill_level: 'advanced',
    });

    // Act
    const result = await userRepository.getUserWithSports(user.id);

    // Assert
    expect(result).not.toBeNull();
    expect(result!.sports).toHaveLength(3);

    // Verify ordering - oldest first
    expect(result!.sports[0].sport_name).toBe('first_sport');
    expect(result!.sports[1].sport_name).toBe('second_sport');
    expect(result!.sports[2].sport_name).toBe('third_sport');
  });

  it('should use LEFT JOIN to ensure user is returned even with 0 sports', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'leftjoin@example.com',
        username: 'leftjoinuser',
        full_name: 'Left Join User',
        password_hash: 'hash123',
        skill_level: 'beginner',
        status: 'active',
      })
      .returning('*');

    // Don't add any sports

    // Act
    const result = await userRepository.getUserWithSports(user.id);

    // Assert - user should be returned even without sports (LEFT JOIN behavior)
    expect(result).not.toBeNull();
    expect(result!.id).toBe(user.id);
    expect(result!.email).toBe('leftjoin@example.com');
    expect(result!.sports).toBeDefined();
    expect(result!.sports).toHaveLength(0);

    // If INNER JOIN was used, result would be null
  });

  it('should respect foreign key constraint ON DELETE CASCADE', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'cascade@example.com',
        username: 'cascadeuser',
        full_name: 'Cascade User',
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

    // Verify sport exists
    let sports = await db('user_sports').where({ user_id: user.id });
    expect(sports).toHaveLength(1);

    // Act - delete user
    await db('users').where({ id: user.id }).del();

    // Assert - sports should be deleted automatically (CASCADE)
    sports = await db('user_sports').where({ user_id: user.id });
    expect(sports).toHaveLength(0);
  });
});
