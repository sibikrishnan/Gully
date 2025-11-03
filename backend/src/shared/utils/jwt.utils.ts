/**
 * JWT Utilities
 * Token generation, validation, and refresh token management
 */

import jwt, { type SignOptions } from 'jsonwebtoken';
import { JWTPayload, TokenPair, UserWithoutPassword } from '../types/auth.types';

// Environment variables with fallback (should be set in .env)
const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '15m'; // Access token: 15 minutes
const JWT_REFRESH_EXPIRES_IN: string = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // Refresh token: 7 days

/**
 * Generate access token
 * @param user - User data (without password)
 * @returns string - JWT access token
 */
export function generateAccessToken(user: UserWithoutPassword): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as string | number,
  });
}

/**
 * Generate refresh token
 * @param user - User data (without password)
 * @returns string - JWT refresh token
 */
export function generateRefreshToken(user: UserWithoutPassword): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN as string | number,
  });
}

/**
 * Generate both access and refresh tokens
 * @param user - User data (without password)
 * @returns TokenPair - Object with accessToken and refreshToken
 */
export function generateTokenPair(user: UserWithoutPassword): TokenPair {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
}

/**
 * Verify and decode access token
 * @param token - JWT access token
 * @returns JWTPayload | null - Decoded token payload or null if invalid
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verify and decode refresh token
 * @param token - JWT refresh token
 * @returns JWTPayload | null - Decoded token payload or null if invalid
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value (e.g., "Bearer <token>")
 * @returns string | null - Extracted token or null if invalid format
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
