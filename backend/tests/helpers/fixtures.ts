/**
 * Test Fixtures
 * Reusable test data and helper functions
 */

import { generateTokenPair } from '../../src/shared/utils/jwt.utils';
import { UserWithoutPassword } from '../../src/shared/types/auth.types';

/**
 * Mock user data (without password)
 */
export const mockUser: UserWithoutPassword = {
  id: 1,
  email: 'test@example.com',
  username: 'testuser',
  full_name: 'Test User',
  phone_number: '+1234567890',
  skill_level: 'intermediate',
  location_lat: 37.7749,
  location_lng: -122.4194,
  location_name: 'San Francisco, CA',
  preferred_radius_km: 10,
  profile_image_url: null,
  status: 'active',
  last_login_at: new Date(),
  created_at: new Date(),
  updated_at: new Date(),
};

/**
 * Generate test tokens for a user
 */
export function generateTestTokens(user: UserWithoutPassword = mockUser) {
  return generateTokenPair(user);
}

/**
 * Valid signup data
 */
export const validSignupData = {
  email: 'newuser@example.com',
  password: 'SecurePass123!',
  username: 'newuser',
  full_name: 'New User',
  phone_number: '+1234567890',
  skill_level: 'beginner',
  location_lat: 37.7749,
  location_lng: -122.4194,
  location_name: 'San Francisco, CA',
  preferred_radius_km: 10,
};

/**
 * Valid login credentials
 */
export const validLoginData = {
  email: 'test1@example.com',
  password: 'Test123!@#',
};

/**
 * Invalid login credentials
 */
export const invalidLoginData = {
  email: 'nonexistent@example.com',
  password: 'WrongPassword123!',
};

/**
 * Weak passwords for testing validation
 */
export const weakPasswords = [
  'short',              // Too short
  'nouppercase123!',   // No uppercase
  'NOLOWERCASE123!',   // No lowercase
  'NoNumbers!',        // No numbers
  'NoSpecial123',      // No special characters
];
