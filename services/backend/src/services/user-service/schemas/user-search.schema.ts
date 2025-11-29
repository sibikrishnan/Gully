/**
 * User Search Validation Schemas
 * Zod validation schemas for user search endpoint query parameters
 */

import { z } from 'zod';

/**
 * Schema for validating search query parameters in GET /api/users/search
 * - query: Optional text search for username/full_name
 * - location_city: Optional city filter
 * - sport: Optional array of sports (['pickleball', 'paddle'])
 * - skill_level: Optional skill level enum
 * - limit: Pagination limit (default 20, max 100)
 * - offset: Pagination offset (default 0, min 0)
 */
export const searchParamsSchema = z.object({
  query: z.string().optional(),
  location_city: z.string().optional(),
  sport: z
    .union([
      z.string().transform(val => [val]), // Single string becomes array
      z.array(z.string()) // Already an array
    ])
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const validSports = ['pickleball', 'paddle'];
        return val.every(sport => validSports.includes(sport));
      },
      {
        message: "Sport must be one of: pickleball, paddle"
      }
    ),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  limit: z
    .union([
      z.string().transform(val => parseInt(val, 10)),
      z.number()
    ])
    .optional()
    .default(20)
    .refine((val) => val > 0 && val <= 100, {
      message: 'Limit must be between 1 and 100'
    }),
  offset: z
    .union([
      z.string().transform(val => parseInt(val, 10)),
      z.number()
    ])
    .optional()
    .default(0)
    .refine((val) => val >= 0, {
      message: 'Offset must be 0 or greater'
    })
});

export type SearchParams = z.infer<typeof searchParamsSchema>;
