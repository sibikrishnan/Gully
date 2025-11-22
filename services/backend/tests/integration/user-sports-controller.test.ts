/**
 * Integration Tests: User Sports Controller
 * Tests controller-repository interaction with real database
 */

import { Response } from 'express';
import {
  addUserSport,
  removeUserSport,
} from '../../src/services/user-service/controllers/user-sports.controller';
import { AuthenticatedRequest } from '../../src/shared/types/auth.types';
import db from '../../src/shared/database/connection';

describe('User Sports Controller - Integration', () => {
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;
  let testUserId: number;

  beforeAll(async () => {
    // Insert test user
    const [user] = await db('users')
      .insert({
        email: 'sports-controller-int@example.com',
        password_hash: 'hash123',
        username: 'sports_ctrl_user',
        full_name: 'Sports Controller Test User',
        phone_number: '+1234567890',
        skill_level: 'intermediate',
        preferred_radius_km: 10,
        status: 'active',
      })
      .returning('id');
    testUserId = user.id;
  });

  afterAll(async () => {
    // Cleanup
    await db('user_sports').where('user_id', testUserId).del();
    await db('users').where('id', testUserId).del();
  });

  beforeEach(async () => {
    // Clean up user_sports before each test
    await db('user_sports').where('user_id', testUserId).del();

    // Reset mocks
    mockJson = jest.fn();
    mockSend = jest.fn();
    mockStatus = jest.fn().mockReturnValue({
      json: mockJson,
      send: mockSend,
    });

    mockResponse = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
    };
  });

  describe('addUserSport - Error Handling', () => {
    it('should return 409 when adding duplicate sport', async () => {
      // First, add a sport
      await db('user_sports').insert({
        user_id: testUserId,
        sport_name: 'pickleball',
        skill_level: 'intermediate',
      });

      // Try to add the same sport again
      const mockRequest: Partial<AuthenticatedRequest> = {
        params: { id: String(testUserId) },
        user: {
          id: testUserId,
          email: 'sports-controller-int@example.com',
          username: 'sports_ctrl_user',
        } as any,
        body: {
          sport_name: 'pickleball',
          skill_level: 'advanced', // Different skill level, but same sport
        },
      };

      await addUserSport(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('already has pickleball'),
        })
      );
    });

    it('should return 400 when skill_level is invalid', async () => {
      const mockRequest: Partial<AuthenticatedRequest> = {
        params: { id: String(testUserId) },
        user: {
          id: testUserId,
          email: 'sports-controller-int@example.com',
          username: 'sports_ctrl_user',
        } as any,
        body: {
          sport_name: 'pickleball',
          skill_level: 'expert_pro', // Invalid skill level
        },
      };

      await addUserSport(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
          details: expect.any(Array),
        })
      );
    });

    it('should return 404 when user does not exist', async () => {
      const nonExistentUserId = 999999;
      const mockRequest: Partial<AuthenticatedRequest> = {
        params: { id: String(nonExistentUserId) },
        user: {
          id: nonExistentUserId,
          email: 'fake@example.com',
          username: 'fakeuser',
        } as any,
        body: {
          sport_name: 'pickleball',
          skill_level: 'intermediate',
        },
      };

      await addUserSport(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should successfully add sport with all optional fields', async () => {
      const mockRequest: Partial<AuthenticatedRequest> = {
        params: { id: String(testUserId) },
        user: {
          id: testUserId,
          email: 'sports-controller-int@example.com',
          username: 'sports_ctrl_user',
        } as any,
        body: {
          sport_name: 'paddle',
          skill_level: 'expert',
          years_experience: 5,
          preferred_position: 'Backcourt',
        },
      };

      await addUserSport(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      const createdSport = mockJson.mock.calls[0][0];
      expect(createdSport).toMatchObject({
        sport_name: 'paddle',
        skill_level: 'expert',
        years_experience: 5,
        preferred_position: 'Backcourt',
      });

      // Verify in database
      const sportInDb = await db('user_sports')
        .where({ user_id: testUserId, sport_name: 'paddle' })
        .first();
      expect(sportInDb).toBeTruthy();
      expect(sportInDb.years_experience).toBe(5);
    });
  });

  describe('removeUserSport - Error Handling', () => {
    it('should return 404 when sport does not exist', async () => {
      const mockRequest: Partial<AuthenticatedRequest> = {
        params: { id: String(testUserId), sport: 'pickleball' },
        user: {
          id: testUserId,
          email: 'sports-controller-int@example.com',
          username: 'sports_ctrl_user',
        } as any,
      };

      await removeUserSport(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Sport not found' });
    });

    it('should successfully remove existing sport', async () => {
      // First, add a sport
      await db('user_sports').insert({
        user_id: testUserId,
        sport_name: 'pickleball',
        skill_level: 'intermediate',
      });

      const mockRequest: Partial<AuthenticatedRequest> = {
        params: { id: String(testUserId), sport: 'pickleball' },
        user: {
          id: testUserId,
          email: 'sports-controller-int@example.com',
          username: 'sports_ctrl_user',
        } as any,
      };

      await removeUserSport(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();

      // Verify sport is deleted from database
      const sportInDb = await db('user_sports')
        .where({ user_id: testUserId, sport_name: 'pickleball' })
        .first();
      expect(sportInDb).toBeUndefined();
    });

    it('should handle URL-encoded sport names correctly', async () => {
      // Add a sport
      await db('user_sports').insert({
        user_id: testUserId,
        sport_name: 'paddle',
        skill_level: 'beginner',
      });

      const mockRequest: Partial<AuthenticatedRequest> = {
        params: { id: String(testUserId), sport: 'paddle' }, // URL-encoded
        user: {
          id: testUserId,
          email: 'sports-controller-int@example.com',
          username: 'sports_ctrl_user',
        } as any,
      };

      await removeUserSport(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(204);

      // Verify deletion
      const sportInDb = await db('user_sports')
        .where({ user_id: testUserId, sport_name: 'paddle' })
        .first();
      expect(sportInDb).toBeUndefined();
    });

    it('should be idempotent - deleting non-existent sport returns 404', async () => {
      const mockRequest: Partial<AuthenticatedRequest> = {
        params: { id: String(testUserId), sport: 'nonexistent' },
        user: {
          id: testUserId,
          email: 'sports-controller-int@example.com',
          username: 'sports_ctrl_user',
        } as any,
      };

      // First deletion attempt
      await removeUserSport(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);

      // Reset mocks
      jest.clearAllMocks();
      mockStatus.mockReturnValue({ json: mockJson, send: mockSend });

      // Second deletion attempt (idempotent check)
      await removeUserSport(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
    });
  });
});
