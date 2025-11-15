/**
 * User Service Validation Schemas
 * Zod validation schemas for user-related endpoints
 */

import { z } from 'zod';

/**
 * Schema for validating user ID parameter in GET /api/users/:id
 * - Coerces string param to number
 * - Validates as positive integer (no 0, negatives, or decimals)
 */
export const getUserParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type GetUserParams = z.infer<typeof getUserParamsSchema>;

/**
 * Base user creation schema (for reference)
 * Defines all updatable user fields with validation rules
 */
const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  full_name: z.string().min(1).max(100),
  phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  location_lat: z.number().min(-90).max(90).optional(),
  location_lng: z.number().min(-180).max(180).optional(),
  location_name: z.string().max(255).optional(),
  preferred_radius_km: z.number().positive().optional(),
  profile_image_url: z.string().url().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

/**
 * Schema for PATCH /api/users/:id - partial user updates
 * - All fields are optional (partial update)
 * - Excludes non-updatable fields: id, password_hash, created_at, updated_at, email
 * - Email updates require separate verification flow (future enhancement)
 */
export const updateUserSchema = createUserSchema
  .omit({ email: true }) // Email updates require verification
  .partial(); // All fields optional for PATCH

export type UpdateUserData = z.infer<typeof updateUserSchema>;

/**
 * Non-updatable fields that must be stripped from update payloads
 */
const NON_UPDATABLE_FIELDS = [
  'id',
  'created_at',
  'updated_at',
  'password_hash',
  'email', // Requires separate verification flow
] as const;

/**
 * Helper function to strip non-updatable fields from request body
 * Prevents clients from attempting to update immutable fields
 * @param data - Raw request body data
 * @returns Sanitized data with non-updatable fields removed
 */
export function stripNonUpdatableFields(data: any): UpdateUserData {
  const sanitized = { ...data };

  // Remove non-updatable fields
  NON_UPDATABLE_FIELDS.forEach((field) => {
    delete sanitized[field];
  });

  return sanitized;
}
