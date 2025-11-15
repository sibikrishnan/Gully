/**
 * Unit Tests: User Update Field Stripping
 * Tests field stripping logic for non-updatable fields
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/shared/types/auth.types';
import { updateUserProfile } from '../../src/services/user-service/controllers/user.controller';
import { UserRepository } from '../../src/services/user-service/repositories/user.repository';
import { stripNonUpdatableFields } from '../../src/services/user-service/schemas/user.schema';

// Mock UserRepository
jest.mock('../../src/services/user-service/repositories/user.repository');

describe('User Update Field Stripping Tests', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
  });

  describe('stripNonUpdatableFields Helper', () => {
    it('should strip id field from payload', () => {
      const input = { id: 999, full_name: 'Valid Name' };
      const result = stripNonUpdatableFields(input);

      expect(result).not.toHaveProperty('id');
      expect(result.full_name).toBe('Valid Name');
    });

    it('should strip created_at field from payload', () => {
      const input = { created_at: new Date(), full_name: 'Valid Name' };
      const result = stripNonUpdatableFields(input);

      expect(result).not.toHaveProperty('created_at');
      expect(result.full_name).toBe('Valid Name');
    });

    it('should strip updated_at field from payload', () => {
      const input = { updated_at: new Date(), full_name: 'Valid Name' };
      const result = stripNonUpdatableFields(input);

      expect(result).not.toHaveProperty('updated_at');
      expect(result.full_name).toBe('Valid Name');
    });

    it('should strip password_hash field from payload', () => {
      const input = { password_hash: 'hacked_password', full_name: 'Valid Name' };
      const result = stripNonUpdatableFields(input);

      expect(result).not.toHaveProperty('password_hash');
      expect(result.full_name).toBe('Valid Name');
    });

    it('should strip email field from payload (requires verification)', () => {
      const input = { email: 'hacker@evil.com', full_name: 'Valid Name' };
      const result = stripNonUpdatableFields(input);

      expect(result).not.toHaveProperty('email');
      expect(result.full_name).toBe('Valid Name');
    });

    it('should allow valid updatable fields (full_name, username, profile_image_url)', () => {
      const input = {
        full_name: 'John Doe',
        username: 'johndoe',
        profile_image_url: 'https://example.com/avatar.jpg',
        phone_number: '+1234567890',
      };
      const result = stripNonUpdatableFields(input);

      expect(result.full_name).toBe('John Doe');
      expect(result.username).toBe('johndoe');
      expect(result.profile_image_url).toBe('https://example.com/avatar.jpg');
      expect(result.phone_number).toBe('+1234567890');
    });
  });

  describe('Controller Field Stripping Integration', () => {
    it('should strip all non-updatable fields before calling repository', async () => {
      // Arrange
      const userId = 123;
      mockRequest = {
        params: { id: '123' },
        user: { id: userId, email: 'test@example.com', username: 'testuser' } as any,
        body: {
          id: 999, // Should be stripped
          email: 'hacker@evil.com', // Should be stripped
          password_hash: 'hacked', // Should be stripped
          created_at: new Date(), // Should be stripped
          updated_at: new Date(), // Should be stripped
          full_name: 'Valid Update', // Should pass through
        },
      };

      const mockUpdatedUser = { id: userId, full_name: 'Valid Update' };
      (UserRepository.prototype.updateUser as jest.Mock).mockResolvedValue(mockUpdatedUser);

      // Act
      await updateUserProfile(mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(UserRepository.prototype.updateUser).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({ full_name: 'Valid Update' })
      );

      // Verify non-updatable fields were NOT passed to repository
      const calledWith = (UserRepository.prototype.updateUser as jest.Mock).mock.calls[0][1];
      expect(calledWith).not.toHaveProperty('id');
      expect(calledWith).not.toHaveProperty('email');
      expect(calledWith).not.toHaveProperty('password_hash');
      expect(calledWith).not.toHaveProperty('created_at');
      expect(calledWith).not.toHaveProperty('updated_at');
    });

    it('should handle empty payload after stripping (no-op update)', async () => {
      // Arrange
      const userId = 123;
      mockRequest = {
        params: { id: '123' },
        user: { id: userId, email: 'test@example.com', username: 'testuser' } as any,
        body: {
          id: 999,
          email: 'hacker@evil.com',
          password_hash: 'hacked',
          // Only non-updatable fields - should result in empty object
        },
      };

      const mockCurrentUser = { id: userId, email: 'test@example.com', full_name: 'Original Name' };
      (UserRepository.prototype.findById as jest.Mock).mockResolvedValue(mockCurrentUser);

      // Act
      await updateUserProfile(mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert - Should return current user data as no-op
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockCurrentUser);
      expect(UserRepository.prototype.updateUser).not.toHaveBeenCalled();
    });
  });
});
