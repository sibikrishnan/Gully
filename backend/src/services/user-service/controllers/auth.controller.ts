/**
 * Auth Controller
 * Handles authentication business logic for signup, login, refresh, and me routes
 */

import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import db from '../../../shared/database/connection';
import { User, UserWithoutPassword, AuthenticatedRequest } from '../../../shared/types/auth.types';
import { hashPassword } from '../../../shared/utils/password.utils';
import { generateTokenPair, verifyRefreshToken } from '../../../shared/utils/jwt.utils';
import { signupSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validators';
import { ZodError } from 'zod';

/**
 * POST /api/auth/signup
 * Register a new user
 */
export async function signup(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const validatedData = signupSchema.parse(req.body);

    // Check if email already exists
    const existingUser = await db<User>('users')
      .where({ email: validatedData.email })
      .first();

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'Email already registered',
      });
      return;
    }

    // Check if username already exists
    const existingUsername = await db<User>('users')
      .where({ username: validatedData.username })
      .first();

    if (existingUsername) {
      res.status(409).json({
        success: false,
        error: 'Username already taken',
      });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password);

    // Create user
    const [newUser] = await db<User>('users')
      .insert({
        email: validatedData.email,
        password_hash: passwordHash,
        username: validatedData.username,
        full_name: validatedData.full_name,
        phone_number: validatedData.phone_number,
        skill_level: validatedData.skill_level,
        location_lat: validatedData.location_lat,
        location_lng: validatedData.location_lng,
        location_name: validatedData.location_name,
        preferred_radius_km: validatedData.preferred_radius_km,
        status: 'active',
      })
      .returning('*');

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = newUser;

    // Generate tokens
    const tokens = generateTokenPair(userWithoutPassword as UserWithoutPassword);

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: error.errors[0].message,
        details: error.errors,
      });
      return;
    }

    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during signup',
    });
  }
}

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Validate request body
    loginSchema.parse(req.body);

    // Use Passport local strategy for authentication
    passport.authenticate('local', (err: any, user: UserWithoutPassword | false, info: any) => {
      if (err) {
        res.status(500).json({
          success: false,
          error: 'Internal server error during authentication',
        });
        return;
      }

      if (!user) {
        res.status(info?.message?.includes('not active') ? 403 : 401).json({
          success: false,
          error: info?.message || 'Authentication failed',
        });
        return;
      }

      // Generate tokens
      const tokens = generateTokenPair(user);

      res.status(200).json({
        success: true,
        data: {
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    })(req, res, next);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: error.errors[0].message,
        details: error.errors,
      });
      return;
    }

    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during login',
    });
  }
}

/**
 * POST /api/auth/refresh
 * Generate new access token using refresh token
 */
export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const validatedData = refreshTokenSchema.parse(req.body);

    // Verify refresh token
    const decoded = verifyRefreshToken(validatedData.refreshToken);

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token',
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

    if (user.status !== 'active') {
      res.status(403).json({
        success: false,
        error: 'Account is not active',
      });
      return;
    }

    // Remove password hash
    const { password_hash, ...userWithoutPassword } = user;

    // Generate new token pair
    const tokens = generateTokenPair(userWithoutPassword as UserWithoutPassword);

    res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: error.errors[0].message,
        details: error.errors,
      });
      return;
    }

    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during token refresh',
    });
  }
}

/**
 * GET /api/auth/me
 * Get current authenticated user data
 */
export async function me(req: Request, res: Response): Promise<void> {
  try {
    const authenticatedReq = req as AuthenticatedRequest;

    if (!authenticatedReq.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: authenticatedReq.user,
      },
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
