/**
 * User Sports Validation Schemas
 * Zod validation schemas for sport preference endpoints
 */

import { z } from 'zod';

/**
 * Supported sports for MVP
 * POC focuses on pickleball and paddle
 */
export const SUPPORTED_SPORTS = ['pickleball', 'paddle'] as const;

/**
 * Skill levels for sports
 */
export const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const;

/**
 * Schema for POST /api/users/:id/sports
 * Add a sport preference to user profile
 */
export const addSportSchema = z.object({
  sport_name: z.enum(SUPPORTED_SPORTS, {
    errorMap: () => ({ message: 'sport_name must be either "pickleball" or "paddle"' }),
  }),
  skill_level: z.enum(SKILL_LEVELS, {
    errorMap: () => ({
      message: 'skill_level must be one of: beginner, intermediate, advanced, expert',
    }),
  }),
  years_experience: z
    .number()
    .int()
    .min(0, 'years_experience must be at least 0')
    .max(50, 'years_experience cannot exceed 50 years')
    .optional(),
  preferred_position: z
    .string()
    .max(100, 'preferred_position cannot exceed 100 characters')
    .optional(),
});

export type AddSportData = z.infer<typeof addSportSchema>;

/**
 * Schema for validating user ID in route params
 * Used for both POST and DELETE routes
 */
export const sportUserParamsSchema = z.object({
  id: z.coerce.number().int().positive({
    message: 'User ID must be a positive integer',
  }),
});

export type SportUserParams = z.infer<typeof sportUserParamsSchema>;

/**
 * Schema for DELETE /api/users/:id/sports/:sport
 * Remove a sport preference from user profile
 */
export const deleteSportParamsSchema = z.object({
  id: z.coerce.number().int().positive({
    message: 'User ID must be a positive integer',
  }),
  sport: z.string().min(1, 'Sport name is required'),
});

export type DeleteSportParams = z.infer<typeof deleteSportParamsSchema>;

/**
 * Helper function to validate sport name against supported sports
 * Used for additional validation in DELETE endpoint
 * @param sportName - Sport name from URL parameter
 * @returns true if valid, false otherwise
 */
export function isValidSportName(sportName: string): boolean {
  return (SUPPORTED_SPORTS as readonly string[]).includes(sportName);
}
