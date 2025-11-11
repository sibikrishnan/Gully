/**
 * Authentication Middleware
 * Protect routes and verify JWT tokens
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt.utils';
import db from '../database/connection';
import { User, UserWithoutPassword, AuthenticatedRequest } from '../types/auth.types';

/**
 * Middleware to protect routes - requires valid JWT access token
 * Attaches user data to req.user
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'No authentication token provided',
      });
      return;
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
      return;
    }

    // Fetch user from database
    const user = await db<User>('users')
      .where({ id: decoded.userId })
      .first();

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Check if user is active
    if (user.status !== 'active') {
      res.status(403).json({
        success: false,
        error: 'Account is not active',
      });
      return;
    }

    // Remove password hash and attach user to request
    const { password_hash, ...userWithoutPassword } = user;
    (req as AuthenticatedRequest).user = userWithoutPassword as UserWithoutPassword;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error during authentication',
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches user if valid token is provided, but doesn't fail if missing
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      // No token provided, continue without user
      next();
      return;
    }

    // Try to verify token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      // Invalid token, continue without user
      next();
      return;
    }

    // Fetch user from database
    const user = await db<User>('users')
      .where({ id: decoded.userId })
      .first();

    if (user && user.status === 'active') {
      const { password_hash, ...userWithoutPassword } = user;
      (req as AuthenticatedRequest).user = userWithoutPassword as UserWithoutPassword;
    }

    next();
  } catch (error) {
    // On error, continue without user rather than failing
    next();
  }
}

/**
 * Middleware to check if user has specific status
 * Must be used after requireAuth
 */
export function requireStatus(...allowedStatuses: Array<'active' | 'inactive' | 'suspended'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (!allowedStatuses.includes(user.status)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
}
