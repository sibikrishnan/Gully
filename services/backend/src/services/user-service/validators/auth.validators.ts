/**
 * Auth Validators
 * Zod schemas for authentication request validation
 */

import { z } from 'zod';

/**
 * Password validation helper
 * Ensures password meets strength requirements
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    'Password must contain at least one special character'
  );

/**
 * Signup request validator
 */
export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: passwordSchema,
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must not exceed 100 characters'),
  phone_number: z.string().optional(),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  location_lat: z.number().min(-90).max(90).optional(),
  location_lng: z.number().min(-180).max(180).optional(),
  location_name: z.string().max(255).optional(),
  preferred_radius_km: z.number().positive().default(10),
});

export type SignupRequest = z.infer<typeof signupSchema>;

/**
 * Login request validator
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof loginSchema>;

/**
 * Refresh token request validator
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;
