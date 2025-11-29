/**
 * Integration Tests - Auth Middleware
 * Tests for requireAuth, optionalAuth, and requireStatus middleware
 */

import { Request, Response, NextFunction } from 'express';
import { requireAuth, optionalAuth, requireStatus } from '../../src/shared/middleware/auth.middleware';
import db from '../../src/shared/database/connection';
import { createTestUser, generateTestTokens } from '../helpers/fixtures';
import { User } from '../../src/shared/types/auth.types';

describe('Auth Middleware Integration Tests', () => {
  let testUser: User;
  let accessToken: string;

  // Setup: Create test user and generate tokens before all tests
  beforeAll(async () => {
    // Create test user
    testUser = await createTestUser(db, {
      email: 'middleware.test@example.com',
      username: 'middlewareuser',
    });

    const tokens = generateTestTokens(testUser);
    accessToken = tokens.accessToken;
  });

  // Cleanup: Delete test data after all tests
  afterAll(async () => {
    await db('users').where({ id: testUser.id }).del();
  });

  describe('requireAuth', () => {
    it('should attach user to request for valid token', async () => {
      const req = {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      await requireAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect((req as any).user).toBeDefined();
      expect((req as any).user.id).toBe(testUser.id);
      expect((req as any).user.email).toBe(testUser.email);
      expect((req as any).user.password_hash).toBeUndefined();
    });

    it('should reject request with no token', async () => {
      const req = {
        headers: {},
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      await requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'No authentication token provided',
      });
    });

    it('should reject request with invalid token', async () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid.token.here',
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      await requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
        })
      );
    });

    it('should reject request with malformed Authorization header', async () => {
      const req = {
        headers: {
          authorization: accessToken, // Missing 'Bearer' prefix
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      await requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should reject request for non-existent user', async () => {
      // Create a user, get token, then delete the user
      const tempUser = await createTestUser(db, {
        email: 'temp@example.com',
        username: 'tempuser',
      });

      const tokens = generateTestTokens(tempUser);

      // Delete the user from database
      await db('users').where({ id: tempUser.id }).del();

      const req = {
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      await requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found',
      });
    });

    it('should reject request for inactive user', async () => {
      // Create an inactive user
      const inactiveUser = await createTestUser(db, {
        email: 'inactive@example.com',
        username: 'inactiveuser',
        status: 'inactive',
      });

      const tokens = generateTestTokens(inactiveUser);

      const req = {
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      await requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Account is not active',
      });

      // Cleanup
      await db('users').where({ id: inactiveUser.id }).del();
    });

    it('should reject request for suspended user', async () => {
      // Create a suspended user
      const suspendedUser = await createTestUser(db, {
        email: 'suspended@example.com',
        username: 'suspendeduser',
        status: 'suspended',
      });

      const tokens = generateTestTokens(suspendedUser);

      const req = {
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      await requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Account is not active',
      });

      // Cleanup
      await db('users').where({ id: suspendedUser.id }).del();
    });
  });

  describe('optionalAuth', () => {
    it('should attach user to request for valid token', async () => {
      const req = {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect((req as any).user).toBeDefined();
      expect((req as any).user.id).toBe(testUser.id);
    });

    it('should continue without user when no token provided', async () => {
      const req = {
        headers: {},
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect((req as any).user).toBeUndefined();
    });

    it('should continue without user when invalid token provided', async () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid.token.here',
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect((req as any).user).toBeUndefined();
    });

    it('should continue without user when malformed header provided', async () => {
      const req = {
        headers: {
          authorization: accessToken, // Missing 'Bearer' prefix
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect((req as any).user).toBeUndefined();
    });

    it('should not attach inactive user to request', async () => {
      // Create an inactive user
      const inactiveUser = await createTestUser(db, {
        email: 'inactive.opt@example.com',
        username: 'inactiveuseropt',
        status: 'inactive',
      });

      const tokens = generateTestTokens(inactiveUser);

      const req = {
        headers: {
          authorization: `Bearer ${tokens.accessToken}`,
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect((req as any).user).toBeUndefined();

      // Cleanup
      await db('users').where({ id: inactiveUser.id }).del();
    });
  });

  describe('requireStatus', () => {
    it('should allow user with required status', () => {
      const req = {
        user: {
          ...testUser,
          status: 'active',
        },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      const middleware = requireStatus('active');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject user without required status', () => {
      const req = {
        user: {
          ...testUser,
          status: 'inactive',
        },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      const middleware = requireStatus('active');
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient permissions',
      });
    });

    it('should allow user with any of multiple allowed statuses', () => {
      const req = {
        user: {
          ...testUser,
          status: 'inactive',
        },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      const middleware = requireStatus('active', 'inactive');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject request with no user attached', () => {
      const req = {} as any; // No user attached

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      const middleware = requireStatus('active');
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required',
      });
    });

    it('should work with suspended status', () => {
      const req = {
        user: {
          ...testUser,
          status: 'suspended',
        },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      const middleware = requireStatus('suspended');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('Middleware Chain', () => {
    it('should work correctly when requireAuth followed by requireStatus', async () => {
      const req = {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next1 = jest.fn() as NextFunction;
      const next2 = jest.fn() as NextFunction;

      // First middleware: requireAuth
      await requireAuth(req, res, next1);
      expect(next1).toHaveBeenCalled();
      expect((req as any).user).toBeDefined();

      // Second middleware: requireStatus
      const statusMiddleware = requireStatus('active');
      statusMiddleware(req, res, next2);
      expect(next2).toHaveBeenCalled();
    });
  });
});
