/**
 * Unit Tests - JWT Utilities
 * Tests for JWT token generation, verification, and extraction
 */

import {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
} from '../../src/shared/utils/jwt.utils';
import { UserWithoutPassword } from '../../src/shared/types/auth.types';
import { mockUser } from '../helpers/fixtures';

describe('JWT Utilities', () => {
  const testUser: UserWithoutPassword = {
    ...mockUser,
    id: 123,
    email: 'jwt.test@example.com',
    username: 'jwtuser',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(testUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include userId, email, and username in payload', () => {
      const token = generateAccessToken(testUser);
      const payload = verifyAccessToken(token);

      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(testUser.id);
      expect(payload?.email).toBe(testUser.email);
      expect(payload?.username).toBe(testUser.username);
    });

    it('should have expiration time', () => {
      const token = generateAccessToken(testUser);
      const payload = verifyAccessToken(token);

      expect(payload?.exp).toBeDefined();
      expect(payload?.iat).toBeDefined();
      expect(payload!.exp!).toBeGreaterThan(payload!.iat!);
    });

    it('should generate different tokens for different users', () => {
      const user1Token = generateAccessToken(testUser);
      const user2Token = generateAccessToken({
        ...testUser,
        id: 456,
        email: 'different@example.com',
      });

      expect(user1Token).not.toBe(user2Token);
    });

    it('should generate different tokens at different times for same user', async () => {
      const token1 = generateAccessToken(testUser);
      // Small delay to ensure different iat (1 second)
      await new Promise(resolve => setTimeout(resolve, 1000));
      const token2 = generateAccessToken(testUser);

      // Tokens will be different due to different iat timestamps
      expect(token1).not.toBe(token2);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(testUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include userId, email, and username in payload', () => {
      const token = generateRefreshToken(testUser);
      const payload = verifyRefreshToken(token);

      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(testUser.id);
      expect(payload?.email).toBe(testUser.email);
      expect(payload?.username).toBe(testUser.username);
    });

    it('should have longer expiration than access token', () => {
      const accessToken = generateAccessToken(testUser);
      const refreshToken = generateRefreshToken(testUser);

      const accessPayload = verifyAccessToken(accessToken);
      const refreshPayload = verifyRefreshToken(refreshToken);

      expect(refreshPayload!.exp!).toBeGreaterThan(accessPayload!.exp!);
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', () => {
      const { accessToken, refreshToken } = generateTokenPair(testUser);

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(typeof accessToken).toBe('string');
      expect(typeof refreshToken).toBe('string');
    });

    it('should generate valid tokens that can be verified', () => {
      const { accessToken, refreshToken } = generateTokenPair(testUser);

      const accessPayload = verifyAccessToken(accessToken);
      const refreshPayload = verifyRefreshToken(refreshToken);

      expect(accessPayload?.userId).toBe(testUser.id);
      expect(refreshPayload?.userId).toBe(testUser.id);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(testUser);
      const payload = verifyAccessToken(token);

      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(testUser.id);
      expect(payload?.email).toBe(testUser.email);
      expect(payload?.username).toBe(testUser.username);
    });

    it('should return null for invalid token', () => {
      const payload = verifyAccessToken('invalid.token.here');

      expect(payload).toBeNull();
    });

    it('should return null for malformed token', () => {
      const payload = verifyAccessToken('notavalidjwt');

      expect(payload).toBeNull();
    });

    it('should return null for empty string', () => {
      const payload = verifyAccessToken('');

      expect(payload).toBeNull();
    });

    it('should return null for refresh token verified as access token', () => {
      const refreshToken = generateRefreshToken(testUser);
      const payload = verifyAccessToken(refreshToken);

      expect(payload).toBeNull();
    });

    it('should reject token signed with wrong secret', () => {
      const jwt = require('jsonwebtoken');
      const fakeToken = jwt.sign(
        { userId: testUser.id, email: testUser.email },
        'wrong-secret',
        { expiresIn: '15m' }
      );

      const payload = verifyAccessToken(fakeToken);
      expect(payload).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(testUser);
      const payload = verifyRefreshToken(token);

      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(testUser.id);
      expect(payload?.email).toBe(testUser.email);
      expect(payload?.username).toBe(testUser.username);
    });

    it('should return null for invalid token', () => {
      const payload = verifyRefreshToken('invalid.token.here');

      expect(payload).toBeNull();
    });

    it('should return null for access token verified as refresh token', () => {
      const accessToken = generateAccessToken(testUser);
      const payload = verifyRefreshToken(accessToken);

      expect(payload).toBeNull();
    });

    it('should reject token signed with wrong secret', () => {
      const jwt = require('jsonwebtoken');
      const fakeToken = jwt.sign(
        { userId: testUser.id, email: testUser.email },
        'wrong-refresh-secret',
        { expiresIn: '7d' }
      );

      const payload = verifyRefreshToken(fakeToken);
      expect(payload).toBeNull();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      const header = `Bearer ${token}`;

      const extracted = extractTokenFromHeader(header);
      expect(extracted).toBe(token);
    });

    it('should return null for missing Authorization header', () => {
      const extracted = extractTokenFromHeader(undefined);
      expect(extracted).toBeNull();
    });

    it('should return null for header without Bearer prefix', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      const extracted = extractTokenFromHeader(token);

      expect(extracted).toBeNull();
    });

    it('should return null for empty header', () => {
      const extracted = extractTokenFromHeader('');
      expect(extracted).toBeNull();
    });

    it('should return null for Bearer without token', () => {
      const extracted = extractTokenFromHeader('Bearer ');
      expect(extracted).toBeNull();
    });

    it('should return null for malformed Bearer header', () => {
      const extracted = extractTokenFromHeader('Bearer');
      expect(extracted).toBeNull();
    });

    it('should handle extra whitespace', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      const header = `Bearer  ${token}`; // Extra space

      const extracted = extractTokenFromHeader(header);
      expect(extracted).toBe(token);
    });

    it('should be case sensitive for Bearer prefix', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      const header = `bearer ${token}`; // lowercase

      const extracted = extractTokenFromHeader(header);
      expect(extracted).toBeNull();
    });
  });

  describe('Token Integration', () => {
    it('should create, verify, and extract tokens in complete flow', () => {
      // Generate tokens
      const { accessToken } = generateTokenPair(testUser);

      // Simulate HTTP header
      const authHeader = `Bearer ${accessToken}`;

      // Extract token
      const extractedToken = extractTokenFromHeader(authHeader);
      expect(extractedToken).toBe(accessToken);

      // Verify token
      const payload = verifyAccessToken(extractedToken!);
      expect(payload?.userId).toBe(testUser.id);
      expect(payload?.email).toBe(testUser.email);
    });
  });
});
