/**
 * Unit tests for NULL value handling in optional fields
 * Tests that optional fields return null/undefined correctly
 */

import { UserRepository } from '../../src/services/user-service/repositories/user.repository';
import { getTestDb, setupTestDb, cleanTestDb, teardownTestDb } from '../helpers/testDb';
import { Knex } from 'knex';

describe('UserRepository - NULL Handling', () => {
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

  it('should return phone_number=null for user with NULL phone_number', async () => {
    // Arrange - create user without phone number
    const [user] = await db('users')
      .insert({
        email: 'nophone@example.com',
        username: 'nophoneuser',
        full_name: 'No Phone User',
        password_hash: 'hash123',
        skill_level: 'beginner',
        status: 'active',
        phone_number: null,
      })
      .returning('*');

    // Act
    const result = await userRepository.findById(user.id);

    // Assert
    expect(result).not.toBeNull();
    expect(result!.phone_number).toBeNull();
  });

  it('should return profile_image_url=null for user with NULL profile_image_url', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'noimage@example.com',
        username: 'noimageuser',
        full_name: 'No Image User',
        password_hash: 'hash123',
        skill_level: 'intermediate',
        status: 'active',
        profile_image_url: null,
      })
      .returning('*');

    // Act
    const result = await userRepository.findById(user.id);

    // Assert
    expect(result).not.toBeNull();
    expect(result!.profile_image_url).toBeNull();
  });

  it('should return NULL location fields (lat/lng/name) when not set', async () => {
    // Arrange - user without location
    const [user] = await db('users')
      .insert({
        email: 'nolocation@example.com',
        username: 'nolocationuser',
        full_name: 'No Location User',
        password_hash: 'hash123',
        skill_level: 'advanced',
        status: 'active',
        location_lat: null,
        location_lng: null,
        location_name: null,
      })
      .returning('*');

    // Act
    const result = await userRepository.findById(user.id);

    // Assert
    expect(result).not.toBeNull();
    expect(result!.location_lat).toBeNull();
    expect(result!.location_lng).toBeNull();
    expect(result!.location_name).toBeNull();
  });

  it('should return NULL years_experience and preferred_position for sports without them', async () => {
    // Arrange
    const [user] = await db('users')
      .insert({
        email: 'nosportdetails@example.com',
        username: 'nosportdetailsuser',
        full_name: 'No Sport Details User',
        password_hash: 'hash123',
        skill_level: 'expert',
        status: 'active',
      })
      .returning('*');

    await db('user_sports').insert({
      user_id: user.id,
      sport_name: 'pickleball',
      skill_level: 'expert',
      years_experience: null,
      preferred_position: null,
    });

    // Act
    const result = await userRepository.getUserWithSports(user.id);

    // Assert
    expect(result).not.toBeNull();
    expect(result!.sports).toHaveLength(1);

    const sport = result!.sports[0];
    expect(sport.years_experience).toBeUndefined(); // Converted from null to undefined
    expect(sport.preferred_position).toBeUndefined(); // Converted from null to undefined
  });
});
