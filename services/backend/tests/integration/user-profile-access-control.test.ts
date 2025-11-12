/**
 * Integration Tests: User Profile Access Control
 * Tests field-level access control with real database
 */

import db from '../../src/shared/database/connection';
import { getUserProfile } from '../../src/services/user-service/controllers/user.controller';
import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/shared/types/auth.types';

describe('User Profile Access Control Integration', () => {
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let testUserId1: number;
  let testUserId2: number;

  beforeAll(async () => {
    // Insert test users
    const [user1] = await db('users')
      .insert({
        email: 'access-test1@example.com',
        password_hash: 'hash1',
        username: 'access_user1',
        full_name: 'Access User One',
        phone_number: '+1111111111',
        skill_level: 'intermediate',
        preferred_radius_km: 10,
        status: 'active',
      })
      .returning('id');
    testUserId1 = user1.id;

    const [user2] = await db('users')
      .insert({
        email: 'access-test2@example.com',
        password_hash: 'hash2',
        username: 'access_user2',
        full_name: 'Access User Two',
        phone_number: '+2222222222',
        skill_level: 'advanced',
        preferred_radius_km: 15,
        status: 'active',
      })
      .returning('id');
    testUserId2 = user2.id;

    // Add sports for user1
    await db('user_sports').insert([
      {
        user_id: testUserId1,
        sport_name: 'pickleball',
        skill_level: 'intermediate',
        years_experience: 2,
      },
    ]);
  });

  afterAll(async () => {
    // Cleanup
    await db('user_sports').where('user_id', testUserId1).del();
    await db('users').whereIn('id', [testUserId1, testUserId2]).del();
  });

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
  });

  describe('Own Profile Access', () => {
    it('should include email and phone_number for own profile', async () => {
      const mockRequest: Partial<AuthenticatedRequest> = {
        params: { id: String(testUserId1) },
        user: {
          id: testUserId1,
          email: 'access-test1@example.com',
          username: 'access_user1',
        } as any,
      };

      await getUserProfile(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      const responseData = mockJson.mock.calls[0][0];
      expect(responseData).toHaveProperty('email', 'access-test1@example.com');
      expect(responseData).toHaveProperty('phone_number', '+1111111111');
      expect(responseData).toHaveProperty('username', 'access_user1');
      expect(responseData).toHaveProperty('sports');
      expect(responseData.sports).toHaveLength(1);
      expect(responseData).not.toHaveProperty('password_hash');
    });
  });

  describe('Other Profile Access', () => {
    it('should exclude email and phone_number for other profile', async () => {
      const mockRequest: Partial<AuthenticatedRequest> = {
        params: { id: String(testUserId2) },
        user: {
          id: testUserId1,
          email: 'access-test1@example.com',
          username: 'access_user1',
        } as any,
      };

      await getUserProfile(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      const responseData = mockJson.mock.calls[0][0];
      expect(responseData).not.toHaveProperty('email');
      expect(responseData).not.toHaveProperty('phone_number');
      expect(responseData).toHaveProperty('username', 'access_user2');
      expect(responseData).toHaveProperty('full_name', 'Access User Two');
      expect(responseData).toHaveProperty('sports');
      expect(responseData).not.toHaveProperty('password_hash');
    });

    it('should return 404 for non-existent user', async () => {
      const mockRequest: Partial<AuthenticatedRequest> = {
        params: { id: '999999' },
        user: {
          id: testUserId1,
          email: 'access-test1@example.com',
          username: 'access_user1',
        } as any,
      };

      await getUserProfile(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });
});
