/**
 * Test Database Utilities
 * Setup, teardown, and seed helpers for tests
 */

import db from '../../src/shared/database/connection';
import { hashPassword } from '../../src/shared/utils/password.utils';
import { User } from '../../src/shared/types/auth.types';

/**
 * Clean all tables (in correct order due to foreign keys)
 */
export async function cleanDatabase(): Promise<void> {
  await db('user_sports').del();
  await db('users').del();
}

/**
 * Seed test users
 */
export async function seedTestUsers(): Promise<User[]> {
  const password = await hashPassword('Test123!@#');

  const users = [
    {
      email: 'test1@example.com',
      password_hash: password,
      username: 'testuser1',
      full_name: 'Test User One',
      phone_number: '+1234567890',
      skill_level: 'intermediate',
      location_lat: 37.7749,
      location_lng: -122.4194,
      location_name: 'San Francisco, CA',
      preferred_radius_km: 10,
      status: 'active',
    },
    {
      email: 'test2@example.com',
      password_hash: password,
      username: 'testuser2',
      full_name: 'Test User Two',
      skill_level: 'beginner',
      preferred_radius_km: 5,
      status: 'active',
    },
    {
      email: 'inactive@example.com',
      password_hash: password,
      username: 'inactiveuser',
      full_name: 'Inactive User',
      skill_level: 'advanced',
      preferred_radius_km: 15,
      status: 'inactive',
    },
  ];

  const insertedUsers = await db('users').insert(users).returning('*');
  return insertedUsers;
}

/**
 * Create a single test user with custom data
 */
export async function createTestUser(
  overrides: Partial<User> = {}
): Promise<User> {
  const defaultPassword = await hashPassword('Test123!@#');

  const defaultUser = {
    email: `test${Date.now()}@example.com`,
    password_hash: defaultPassword,
    username: `testuser${Date.now()}`,
    full_name: 'Test User',
    skill_level: 'intermediate',
    preferred_radius_km: 10,
    status: 'active',
    ...overrides,
  };

  const [user] = await db('users').insert(defaultUser).returning('*');
  return user;
}

/**
 * Setup test database (run before each test suite)
 */
export async function setupTestDb(): Promise<void> {
  await cleanDatabase();
}

/**
 * Teardown test database (run after each test suite)
 */
export async function teardownTestDb(): Promise<void> {
  await cleanDatabase();
}
