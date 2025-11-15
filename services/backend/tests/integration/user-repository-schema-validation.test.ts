/**
 * Integration tests - validate repository queries match actual migration schema
 * Critical tests to ensure schema discovery findings are correctly implemented
 */

import { UserRepository } from '../../src/services/user-service/repositories/user.repository';
import { getTestDb, setupTestDb, cleanTestDb, teardownTestDb } from '../helpers/testDb';
import { Knex } from 'knex';

describe('UserRepository - Migration Schema Validation (Integration)', () => {
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

  it('should use "id" column (integer) not "user_id" or "uuid"', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'idcolumn@example.com',
        username: 'idcolumnuser',
        full_name: 'ID Column User',
        password_hash: 'hash123',
        skill_level: 'intermediate',
        status: 'active',
      })
      .returning('*');

    // Verify schema: users table has 'id' column (not 'user_id')
    expect(user.id).toBeDefined();
    expect(typeof user.id).toBe('number');
    expect(Number.isInteger(user.id)).toBe(true);

    // Act
    const result = await userRepository.findById(user.id);

    // Assert
    expect(result).not.toBeNull();
    expect(result!.id).toBe(user.id);
    expect((result as any).user_id).toBeUndefined();
    expect((result as any).uuid).toBeUndefined();
  });

  it('should use "status" enum column not "is_active" boolean', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'statusenum@example.com',
        username: 'statusenumuser',
        full_name: 'Status Enum User',
        password_hash: 'hash123',
        skill_level: 'beginner',
        status: 'active', // ENUM, not boolean
      })
      .returning('*');

    // Verify schema: users table has 'status' enum (not 'is_active' boolean)
    expect(user.status).toBeDefined();
    expect(typeof user.status).toBe('string');
    expect(['active', 'inactive', 'suspended']).toContain(user.status);

    // Act
    const result = await userRepository.findById(user.id);

    // Assert
    expect(result).not.toBeNull();
    expect(result!.status).toBe('active');
    expect(typeof result!.status).toBe('string');
    expect((result as any).is_active).toBeUndefined();
  });

  it('should use user_sports JOIN with "user_id" FK matching users.id (integer)', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'joinfk@example.com',
        username: 'joinfkuser',
        full_name: 'Join FK User',
        password_hash: 'hash123',
        skill_level: 'advanced',
        status: 'active',
      })
      .returning('*');

    // Insert sport with INTEGER user_id FK
    const [sport] = await db('user_sports')
      .insert({
        user_id: user.id, // INTEGER FK to users.id
        sport_name: 'pickleball',
        skill_level: 'advanced',
      })
      .returning('*');

    // Verify schema: user_sports.user_id is INTEGER FK
    expect(sport.user_id).toBeDefined();
    expect(typeof sport.user_id).toBe('number');
    expect(sport.user_id).toBe(user.id);

    // Act
    const result = await userRepository.getUserWithSports(user.id);

    // Assert
    expect(result).not.toBeNull();
    expect(result!.sports).toHaveLength(1);
    expect(result!.sports[0].sport_name).toBe('pickleball');
  });

  it('should have all column names match migration schema exactly', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'allcolumns@example.com',
        username: 'allcolumnsuser',
        full_name: 'All Columns User',
        password_hash: 'hash123',
        skill_level: 'expert',
        phone_number: '+1234567890',
        location_lat: 40.7128,
        location_lng: -74.0060,
        location_name: 'New York',
        preferred_radius_km: 15,
        profile_image_url: 'https://example.com/image.jpg',
        status: 'active',
      })
      .returning('*');

    // Act
    const result = await userRepository.findById(user.id);

    // Assert - verify all expected columns exist
    expect(result).not.toBeNull();

    // Required columns from migration
    expect(result!.id).toBeDefined();
    expect(result!.email).toBeDefined();
    expect(result!.username).toBeDefined();
    expect(result!.full_name).toBeDefined();
    expect(result!.skill_level).toBeDefined();
    expect(result!.status).toBeDefined();
    expect(result!.preferred_radius_km).toBeDefined();
    expect(result!.created_at).toBeDefined();
    expect(result!.updated_at).toBeDefined();

    // Optional columns
    expect(result!.phone_number).toBeDefined();
    expect(result!.location_lat).toBeDefined();
    expect(result!.location_lng).toBeDefined();
    expect(result!.location_name).toBeDefined();
    expect(result!.profile_image_url).toBeDefined();

    // password_hash should NOT be present
    expect((result as any).password_hash).toBeUndefined();
  });

  it('should show index usage on users.id and user_sports.user_id with EXPLAIN', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'explain@example.com',
        username: 'explainuser',
        full_name: 'Explain User',
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

    // Act - EXPLAIN query for users table
    const explainUsers = await db.raw(`
      EXPLAIN (FORMAT JSON)
      SELECT id, email, username FROM users WHERE id = ? AND status = 'active'
    `, [user.id]);

    // Assert - check if primary key index is used
    const usersExplain = JSON.stringify(explainUsers.rows[0]);
    expect(usersExplain).toContain('Index'); // PostgreSQL should use index

    // Act - EXPLAIN query for user_sports JOIN
    const explainJoin = await db.raw(`
      EXPLAIN (FORMAT JSON)
      SELECT * FROM user_sports WHERE user_id = ?
    `, [user.id]);

    // Assert - check if user_id index is used
    const joinExplain = JSON.stringify(explainJoin.rows[0]);
    expect(joinExplain).toContain('Index'); // Should use user_sports.user_id index
  });
});
