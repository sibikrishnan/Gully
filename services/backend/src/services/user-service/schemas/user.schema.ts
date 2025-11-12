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
