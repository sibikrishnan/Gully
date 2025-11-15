/**
 * Unit Tests: User Update Authorization
 * Tests authorization checks for updateUserProfile controller
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/shared/types/auth.types';
import { updateUserProfile } from '../../src/services/user-service/controllers/user.controller';
import { UserRepository } from '../../src/services/user-service/repositories/user.repository';

// Mock UserRepository
jest.mock('../../src/services/user-service/repositories/user.repository');

describe('User Update Authorization Tests', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock response
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
  });

  describe('Authorization: Own Profile', () => {
    it('should allow user to update own profile (req.user.id === req.params.id)', async () => {
      // Arrange
      const userId = 123;
      mockRequest = {
        params: { id: '123' },
        user: { id: userId, email: 'test@example.com', username: 'testuser' } as any,
        body: { full_name: 'Updated Name' },
      };

      const mockUpdatedUser = { id: userId, full_name: 'Updated Name', email: 'test@example.com' };
      (UserRepository.prototype.updateUser as jest.Mock).mockResolvedValue(mockUpdatedUser);

      // Act
      await updateUserProfile(mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockUpdatedUser);
    });
  });

  describe('Authorization: Other User Profile', () => {
    it('should return 403 when user tries to update another user\'s profile', async () => {
      // Arrange
      mockRequest = {
        params: { id: '999' },
        user: { id: 123, email: 'test@example.com', username: 'testuser' } as any,
        body: { full_name: 'Hacker Attempt' },
      };

      // Act
      await updateUserProfile(mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Forbidden: You can only update your own profile'
      });
      expect(UserRepository.prototype.updateUser).not.toHaveBeenCalled();
    });

    it('should return 403 when req.user is undefined (missing JWT)', async () => {
      // Arrange
      mockRequest = {
        params: { id: '123' },
        user: undefined,
        body: { full_name: 'Anonymous Update' },
      };

      // Act
      await updateUserProfile(mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Forbidden: You can only update your own profile'
      });
    });
  });

  describe('Authorization: Edge Cases', () => {
    it('should handle user ID type mismatch (string vs number)', async () => {
      // Arrange
      mockRequest = {
        params: { id: '123' }, // String from URL params
        user: { id: 123, email: 'test@example.com', username: 'testuser' } as any, // Number from JWT
        body: { full_name: 'Updated Name' },
      };

      const mockUpdatedUser = { id: 123, full_name: 'Updated Name' };
      (UserRepository.prototype.updateUser as jest.Mock).mockResolvedValue(mockUpdatedUser);

      // Act
      await updateUserProfile(mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert - Should succeed because parseInt handles type coercion
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockUpdatedUser);
    });

    it('should return 404 when user does not exist (after authorization passes)', async () => {
      // Arrange
      mockRequest = {
        params: { id: '123' },
        user: { id: 123, email: 'test@example.com', username: 'testuser' } as any,
        body: { full_name: 'Updated Name' },
      };

      (UserRepository.prototype.updateUser as jest.Mock).mockResolvedValue(null);

      // Act
      await updateUserProfile(mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });
});
