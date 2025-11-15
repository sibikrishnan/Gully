/**
 * Integration Tests: User Update Controller Flow
 * Tests complete update flow from controller through repository to database
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/shared/types/auth.types';
import { updateUserProfile } from '../../src/services/user-service/controllers/user.controller';
import { getTestDb, setupTestDb, cleanTestDb, teardownTestDb } from '../helpers/testDb';
import { Knex } from 'knex';

describe('User Update Controller - Integration Flow', () => {
  let db: Knex;
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeAll(async () => {
    await setupTestDb();
    db = getTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  afterEach(async () => {
    await cleanTestDb();
  });

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
  });

  describe('Successful Update Flows', () => {
    it('should update full_name and return 200 with updated user', async () => {
      // Arrange - Create test user
      const [user] = await db('users')
        .insert({
          email: 'update1@example.com',
          username: 'updateuser1',
          full_name: 'Original Name',
          password_hash: 'hash123',
          skill_level: 'beginner',
          status: 'active',
        })
        .returning('*');

      mockRequest = {
        params: { id: user.id.toString() },
        user: { id: user.id, email: user.email, username: user.username } as any,
        body: { full_name: 'Updated Name' },
      };

      // Act
      await updateUserProfile(mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(200);
      const returnedUser = mockJson.mock.calls[0][0];
      expect(returnedUser.full_name).toBe('Updated Name');
      expect(returnedUser.id).toBe(user.id);

      // Verify database was actually updated
      const dbUser = await db('users').where({ id: user.id }).first();
      expect(dbUser.full_name).toBe('Updated Name');
    });

    it('should update multiple fields (username, location_name) and return 200', async () => {
      // Arrange
      const [user] = await db('users')
        .insert({
          email: 'update2@example.com',
          username: 'updateuser2',
          full_name: 'Test User',
          password_hash: 'hash123',
          skill_level: 'intermediate',
          status: 'active',
        })
        .returning('*');

      mockRequest = {
        params: { id: user.id.toString() },
        user: { id: user.id, email: user.email, username: user.username } as any,
        body: {
          username: 'newusername',
          location_name: 'San Francisco',
          skill_level: 'advanced',
        },
      };

      // Act
      await updateUserProfile(mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(200);
      const returnedUser = mockJson.mock.calls[0][0];
      expect(returnedUser.username).toBe('newusername');
      expect(returnedUser.location_name).toBe('San Francisco');
      expect(returnedUser.skill_level).toBe('advanced');

      // Verify database
      const dbUser = await db('users').where({ id: user.id }).first();
      expect(dbUser.username).toBe('newusername');
      expect(dbUser.location_name).toBe('San Francisco');
      expect(dbUser.skill_level).toBe('advanced');
    });

    it('should handle empty update payload (no-op) and return 200 with unchanged user', async () => {
      // Arrange
      const [user] = await db('users')
        .insert({
          email: 'noop@example.com',
          username: 'noopuser',
          full_name: 'Original Name',
          password_hash: 'hash123',
          skill_level: 'beginner',
          status: 'active',
        })
        .returning('*');

      mockRequest = {
        params: { id: user.id.toString() },
        user: { id: user.id, email: user.email, username: user.username } as any,
        body: {}, // Empty payload
      };

      // Act
      await updateUserProfile(mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(200);
      const returnedUser = mockJson.mock.calls[0][0];
      expect(returnedUser.full_name).toBe('Original Name');

      // Verify database unchanged
      const dbUser = await db('users').where({ id: user.id }).first();
      expect(dbUser.full_name).toBe('Original Name');
    });
  });

  describe('Error Handling Flows', () => {
    it('should return 404 when user does not exist', async () => {
      // Arrange
      const nonExistentUserId = 99999;
      mockRequest = {
        params: { id: nonExistentUserId.toString() },
        user: { id: nonExistentUserId, email: 'test@example.com', username: 'test' } as any,
        body: { full_name: 'Updated Name' },
      };

      // Act
      await updateUserProfile(mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 403 when user tries to update another user\'s profile', async () => {
      // Arrange - Create two users
      const [user1] = await db('users')
        .insert({
          email: 'user1@example.com',
          username: 'user1',
          full_name: 'User One',
          password_hash: 'hash123',
          skill_level: 'beginner',
          status: 'active',
        })
        .returning('*');

      const [user2] = await db('users')
        .insert({
          email: 'user2@example.com',
          username: 'user2',
          full_name: 'User Two',
          password_hash: 'hash456',
          skill_level: 'beginner',
          status: 'active',
        })
        .returning('*');

      // User1 tries to update User2's profile
      mockRequest = {
        params: { id: user2.id.toString() },
        user: { id: user1.id, email: user1.email, username: user1.username } as any,
        body: { full_name: 'Hacked Name' },
      };

      // Act
      await updateUserProfile(mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Forbidden: You can only update your own profile'
      });

      // Verify User2 data unchanged
      const dbUser2 = await db('users').where({ id: user2.id }).first();
      expect(dbUser2.full_name).toBe('User Two');
    });

    it('should return 409 when username already exists', async () => {
      // Arrange - Create two users
      await db('users')
        .insert({
          email: 'user1@example.com',
          username: 'existinguser',
          full_name: 'User One',
          password_hash: 'hash123',
          skill_level: 'beginner',
          status: 'active',
        })
        .returning('*');

      const [user2] = await db('users')
        .insert({
          email: 'user2@example.com',
          username: 'user2',
          full_name: 'User Two',
          password_hash: 'hash456',
          skill_level: 'beginner',
          status: 'active',
        })
        .returning('*');

      // User2 tries to update username to user1's username
      mockRequest = {
        params: { id: user2.id.toString() },
        user: { id: user2.id, email: user2.email, username: user2.username } as any,
        body: { username: 'existinguser' },
      };

      // Act
      await updateUserProfile(mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Username already exists' });
    });
  });

  describe('Field Stripping and Security', () => {
    it('should strip non-updatable fields (id, email, password_hash) from update', async () => {
      // Arrange
      const [user] = await db('users')
        .insert({
          email: 'security@example.com',
          username: 'securityuser',
          full_name: 'Security Test',
          password_hash: 'original_hash',
          skill_level: 'beginner',
          status: 'active',
        })
        .returning('*');

      mockRequest = {
        params: { id: user.id.toString() },
        user: { id: user.id, email: user.email, username: user.username } as any,
        body: {
          id: 99999, // Attempt to change ID
          email: 'hacker@evil.com', // Attempt to change email
          password_hash: 'hacked_password', // Attempt to change password
          full_name: 'Valid Update', // Valid field
        },
      };

      // Act
      await updateUserProfile(mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(200);

      // Verify malicious fields were NOT updated
      const dbUser = await db('users').where({ id: user.id }).first();
      expect(dbUser.id).toBe(user.id); // ID unchanged
      expect(dbUser.email).toBe('security@example.com'); // Email unchanged
      expect(dbUser.password_hash).toBe('original_hash'); // Password unchanged
      expect(dbUser.full_name).toBe('Valid Update'); // Valid field updated
    });

    it('should automatically update updated_at timestamp', async () => {
      // Arrange
      const [user] = await db('users')
        .insert({
          email: 'timestamp@example.com',
          username: 'timestampuser',
          full_name: 'Timestamp Test',
          password_hash: 'hash123',
          skill_level: 'beginner',
          status: 'active',
        })
        .returning('*');

      const originalUpdatedAt = user.updated_at;

      // Wait to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      mockRequest = {
        params: { id: user.id.toString() },
        user: { id: user.id, email: user.email, username: user.username } as any,
        body: { full_name: 'Updated Name' },
      };

      // Act
      await updateUserProfile(mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      const dbUser = await db('users').where({ id: user.id }).first();
      expect(new Date(dbUser.updated_at).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
    });
  });
});
