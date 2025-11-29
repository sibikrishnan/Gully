/**
 * Unit Tests: User Sports Controller
 * Tests authorization and validation logic for addUserSport and removeUserSport
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/shared/types/auth.types';

// Mock the repositories
const mockAddUserSport = jest.fn();
const mockRemoveUserSport = jest.fn();
const mockFindById = jest.fn();

jest.mock('../../src/services/user-service/repositories/user-sports.repository', () => ({
  UserSportsRepository: jest.fn().mockImplementation(() => ({
    addUserSport: mockAddUserSport,
    removeUserSport: mockRemoveUserSport,
  })),
}));

jest.mock('../../src/services/user-service/repositories/user.repository', () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    findById: mockFindById,
  })),
}));

// Import after mocking
import {
  addUserSport,
  removeUserSport,
} from '../../src/services/user-service/controllers/user-sports.controller';

describe('User Sports Controller - Authorization and Validation', () => {
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup response mocks
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

  describe('addUserSport - Authorization', () => {
    it('should return 201 when user adds sport to own profile', async () => {
      const userId = 123;
      const mockRequest: Partial<AuthenticatedRequest> = {
        params: { id: String(userId) },
        user: { id: userId, email: 'test@example.com', username: 'testuser' } as any,
        body: {
          sport_name: 'pickleball',
          skill_level: 'intermediate',
        },
      };

      const createdSport = {
        sport_name: 'pickleball',
        skill_level: 'intermediate',
        years_experience: null,
        preferred_position: null,
      };

      mockAddUserSport.mockResolvedValue(createdSport);

      await addUserSport(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(createdSport);
    });

    it('should return 403 when user tries to add sport to another user profile', async () => {
      const mockRequest: Partial<AuthenticatedRequest> = {
        params: { id: '456' }, // Different user ID
        user: { id: 123, email: 'test@example.com', username: 'testuser' } as any,
        body: {
          sport_name: 'pickleball',
          skill_level: 'intermediate',
        },
      };

      await addUserSport(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Forbidden: You can only manage your own sports',
      });
      expect(mockAddUserSport).not.toHaveBeenCalled();
    });

    it('should return 403 when user is not authenticated', async () => {
      const mockRequest: Partial<AuthenticatedRequest> = {
        params: { id: '123' },
        user: undefined, // Not authenticated
        body: {
          sport_name: 'pickleball',
          skill_level: 'intermediate',
        },
      };

      await addUserSport(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Forbidden: You can only manage your own sports',
      });
    });

    it('should return 400 when validation fails (invalid sport_name)', async () => {
      const userId = 123;
      const mockRequest: Partial<AuthenticatedRequest> = {
        params: { id: String(userId) },
        user: { id: userId, email: 'test@example.com', username: 'testuser' } as any,
        body: {
          sport_name: 'invalid_sport', // Not in SUPPORTED_SPORTS
          skill_level: 'intermediate',
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
      expect(mockAddUserSport).not.toHaveBeenCalled();
    });
  });

  describe('removeUserSport - Authorization', () => {
    it('should return 204 when user removes sport from own profile', async () => {
      const userId = 123;
      const mockRequest: Partial<AuthenticatedRequest> = {
        params: { id: String(userId), sport: 'pickleball' },
        user: { id: userId, email: 'test@example.com', username: 'testuser' } as any,
      };

      const mockUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        status: 'active',
      };

      mockFindById.mockResolvedValue(mockUser);
      mockRemoveUserSport.mockResolvedValue(true); // Sport deleted

      await removeUserSport(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should return 403 when user tries to remove sport from another user profile', async () => {
      const mockRequest: Partial<AuthenticatedRequest> = {
        params: { id: '456', sport: 'pickleball' }, // Different user ID
        user: { id: 123, email: 'test@example.com', username: 'testuser' } as any,
      };

      await removeUserSport(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Forbidden: You can only manage your own sports',
      });
      expect(mockFindById).not.toHaveBeenCalled();
    });

    it('should return 403 when user is not authenticated', async () => {
      const mockRequest: Partial<AuthenticatedRequest> = {
        params: { id: '123', sport: 'pickleball' },
        user: undefined, // Not authenticated
      };

      await removeUserSport(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Forbidden: You can only manage your own sports',
      });
    });

    it('should return 404 when user does not exist', async () => {
      const userId = 123;
      const mockRequest: Partial<AuthenticatedRequest> = {
        params: { id: String(userId), sport: 'pickleball' },
        user: { id: userId, email: 'test@example.com', username: 'testuser' } as any,
      };

      mockFindById.mockResolvedValue(null); // User not found

      await removeUserSport(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User not found' });
      expect(mockRemoveUserSport).not.toHaveBeenCalled();
    });
  });
});
