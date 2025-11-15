import { Knex } from 'knex';
import { User, SignupData, TokenPair, UserWithoutPassword } from '../../src/shared/types/auth.types';
import { hashPassword } from '../../src/shared/utils/password.utils';
import { generateAccessToken, generateRefreshToken } from '../../src/shared/utils/jwt.utils';

/**
 * Default test user data
 */
export const testUserData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'password_hash'> & { password: string } = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  username: 'testuser',
  full_name: 'Test User',
  phone_number: '+1234567890',
  skill_level: 'intermediate',
  location_lat: 40.7128,
  location_lng: -74.0060,
  location_name: 'New York, NY',
  preferred_radius_km: 10,
  profile_image_url: undefined,
  status: 'active',
  last_login_at: undefined,
};

/**
 * Create a test user in the database
 */
export const createTestUser = async (
  db: Knex,
  overrides?: Partial<typeof testUserData>
): Promise<User> => {
  const userData = { ...testUserData, ...overrides };
  const { password, ...dbUserData } = userData;
  
  const passwordHash = await hashPassword(password);
  
  const [user] = await db('users')
    .insert({
      ...dbUserData,
      password_hash: passwordHash,
    })
    .returning('*');
  
  return user;
};

/**
 * Create multiple test users
 */
export const createTestUsers = async (
  db: Knex,
  count: number,
  overrides?: Partial<typeof testUserData>
): Promise<User[]> => {
  const users: User[] = [];
  
  for (let i = 0; i < count; i++) {
    const user = await createTestUser(db, {
      ...overrides,
      email: `test${i}@example.com`,
      username: `testuser${i}`,
      full_name: `Test User ${i}`,
    });
    users.push(user);
  }
  
  return users;
};

/**
 * Generate test JWT tokens for a user
 */
export const generateTestTokens = (user: User): TokenPair => {
  // Remove password_hash to create UserWithoutPassword
  const { password_hash, ...userWithoutPassword } = user;

  return {
    accessToken: generateAccessToken(userWithoutPassword as UserWithoutPassword),
    refreshToken: generateRefreshToken(userWithoutPassword as UserWithoutPassword),
  };
};

/**
 * Create signup data for testing
 */
export const createSignupData = (overrides?: Partial<SignupData>): SignupData => {
  return {
    email: 'newuser@example.com',
    password: 'NewUserPass123!',
    username: 'newuser',
    full_name: 'New User',
    skill_level: 'beginner',
    preferred_radius_km: 15,
    ...overrides,
  };
};

/**
 * Common test constants
 */
export const TEST_CONSTANTS = {
  VALID_PASSWORD: 'ValidPass123!',
  WEAK_PASSWORD: '123',
  INVALID_EMAIL: 'not-an-email',
  VALID_EMAIL: 'valid@example.com',
};

/**
 * Mock user data for tests (UserWithoutPassword)
 */
export const mockUser: UserWithoutPassword = {
  id: 1,
  email: 'mock@example.com',
  username: 'mockuser',
  full_name: 'Mock User',
  phone_number: '+1234567890',
  skill_level: 'intermediate',
  location_lat: 40.7128,
  location_lng: -74.0060,
  location_name: 'New York, NY',
  preferred_radius_km: 10,
  profile_image_url: undefined,
  status: 'active',
  last_login_at: undefined,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
};
