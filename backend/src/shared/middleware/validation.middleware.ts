/**
 * Validation Middleware
 * Validates request data using Zod schemas
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

/**
 * Middleware factory to validate request data against Zod schemas
 * @param schemas - Object containing Zod schemas for body, params, and/or query
 * @returns Express middleware function
 */
export function validateRequest(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate body if schema provided
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      // Validate params if schema provided
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      // Validate query if schema provided
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Validation error',
            statusCode: 400,
            details: error.errors.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
        });
        return;
      }

      // Unexpected error
      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          statusCode: 500,
        },
      });
    }
  };
}
