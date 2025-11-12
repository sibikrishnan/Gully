/**
 * Authentication Types
 * Core TypeScript interfaces and types for authentication
 */

/**
 * User entity from database
 */
export interface User {
  id: number;
  email: string;
  password_hash: string;
  username: string;
  full_name: string;
  phone_number?: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  location_lat?: number;
  location_lng?: number;
  location_name?: string;
  preferred_radius_km: number;
  profile_image_url?: string;
  status: 'active' | 'inactive' | 'suspended';
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Safe user data (without password hash)
 */
export interface UserWithoutPassword extends Omit<User, 'password_hash'> {}

/**
 * User sport data
 */
export interface UserSport {
  sport_name: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_experience?: number;
  preferred_position?: string;
}

/**
 * User with associated sports
 */
export interface UserWithSports extends UserWithoutPassword {
  sports: UserSport[];
}

/**
 * JWT payload structure
 */
export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

/**
 * JWT token pair
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Signup data
 */
export interface SignupData {
  email: string;
  password: string;
  username: string;
  full_name: string;
  phone_number?: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  location_lat?: number;
  location_lng?: number;
  location_name?: string;
  preferred_radius_km?: number;
}

/**
 * Express Request with authenticated user
 */
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: UserWithoutPassword;
}
