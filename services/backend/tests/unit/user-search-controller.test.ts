/**
 * Unit tests for User Search Controller
 * Tests query processing, service orchestration, error handling, and response formatting
 */

import { Request, Response } from 'express';

// Mock UserSearchService
const mockSearch = jest.fn();

jest.mock('../../src/services/user-service/services/user-search.service', () => ({
  UserSearchService: jest.fn().mockImplementation(() => ({
    search: mockSearch,
  })),
}));

// Import after mocking
import { searchUsers } from '../../src/services/user-service/controllers/user-search.controller';

describe('UserSearchController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSetHeader: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup response mocks
    mockJson = jest.fn();
    mockSetHeader = jest.fn();
    mockStatus = jest.fn().mockReturnValue({
      json: mockJson,
    });

    // Create mock request
    mockReq = {
      query: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:3000'),
      path: '/api/users/search'
    };

    // Create mock response
    mockRes = {
      status: mockStatus,
      json: mockJson,
      setHeader: mockSetHeader
    };
  });

  describe('Query Parameter Processing', () => {
    it('should extract and process query parameters correctly', async () => {
      // Arrange
      mockReq.query = {
        query: 'john',
        location_city: 'New York',
        sport: ['pickleball'],
        skill_level: 'intermediate' as any,
        limit: 20 as any,
        offset: 0 as any
      };

      const mockResult = {
        data: [],
        pagination: {
          total: 0,
          limit: 20,
          offset: 0,
          currentPage: 1,
          totalPages: 0,
          hasMore: false
        }
      };

      mockSearch.mockResolvedValue(mockResult);

      // Act
      await searchUsers(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockSearch).toHaveBeenCalledWith(
        {
          query: 'john',
          location_city: 'New York',
          sport: ['pickleball'],
          skill_level: 'intermediate'
        },
        {
          limit: 20,
          offset: 0
        }
      );
    });

    it('should apply default values when limit and offset not provided', async () => {
      // Arrange
      mockReq.query = {
        query: 'jane'
      };

      const mockResult = {
        data: [],
        pagination: {
          total: 0,
          limit: 20,
          offset: 0,
          currentPage: 1,
          totalPages: 0,
          hasMore: false
        }
      };

      mockSearch.mockResolvedValue(mockResult);

      // Act
      await searchUsers(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'jane'
        }),
        {
          limit: 20,
          offset: 0
        }
      );
    });
  });

  describe('Service Orchestration', () => {
    it('should call search service and return results', async () => {
      // Arrange
      mockReq.query = {
        query: 'test',
        limit: 10 as any,
        offset: 0 as any
      };

      const mockUsers = [
        { id: 1, username: 'test1', full_name: 'Test User 1' },
        { id: 2, username: 'test2', full_name: 'Test User 2' }
      ];

      const mockResult = {
        data: mockUsers,
        pagination: {
          total: 2,
          limit: 10,
          offset: 0,
          currentPage: 1,
          totalPages: 1,
          hasMore: false
        }
      };

      mockSearch.mockResolvedValue(mockResult);

      // Act
      await searchUsers(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockSearch).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockResult);
    });

    it('should pass correct parameters to service methods', async () => {
      // Arrange
      mockReq.query = {
        location_city: 'Boston',
        sport: ['pickleball', 'paddle'],
        skill_level: 'advanced' as any,
        limit: 50 as any,
        offset: 10 as any
      };

      const mockResult = {
        data: [],
        pagination: {
          total: 100,
          limit: 50,
          offset: 10,
          currentPage: 1,
          totalPages: 2,
          hasMore: true
        }
      };

      mockSearch.mockResolvedValue(mockResult);

      // Act
      await searchUsers(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockSearch).toHaveBeenCalledWith(
        {
          query: undefined,
          location_city: 'Boston',
          sport: ['pickleball', 'paddle'],
          skill_level: 'advanced'
        },
        {
          limit: 50,
          offset: 10
        }
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors and return 400', async () => {
      // Arrange
      mockReq.query = {
        limit: 200 as any // Exceeds max
      };

      const validationError = new Error('Validation failed');
      validationError.name = 'ZodError';
      (validationError as any).errors = [
        { path: ['limit'], message: 'Limit must be between 1 and 100' }
      ];

      mockSearch.mockRejectedValue(validationError);

      // Act
      await searchUsers(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed'
        })
      );
    });

    it('should handle database errors and return 500', async () => {
      // Arrange
      mockReq.query = {
        query: 'test'
      };

      const dbError = new Error('Database connection failed');
      mockSearch.mockRejectedValue(dbError);

      // Act
      await searchUsers(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('Response Formatting', () => {
    it('should format response with data array and pagination metadata', async () => {
      // Arrange
      mockReq.query = {
        query: 'test'
      };

      const mockResult = {
        data: [
          { id: 1, username: 'user1' },
          { id: 2, username: 'user2' }
        ],
        pagination: {
          total: 2,
          limit: 20,
          offset: 0,
          currentPage: 1,
          totalPages: 1,
          hasMore: false
        }
      };

      mockSearch.mockResolvedValue(mockResult);

      // Act
      await searchUsers(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Array),
          pagination: expect.objectContaining({
            total: expect.any(Number),
            limit: expect.any(Number),
            offset: expect.any(Number),
            hasMore: expect.any(Boolean)
          })
        })
      );
    });

    it('should set pagination headers (X-Total-Count and Link)', async () => {
      // Arrange
      mockReq.query = {
        query: 'test',
        limit: 10 as any,
        offset: 0 as any
      };

      const mockResult = {
        data: Array(10).fill(null).map((_, i) => ({ id: i + 1, username: `user${i + 1}` })),
        pagination: {
          total: 25,
          limit: 10,
          offset: 0,
          currentPage: 1,
          totalPages: 3,
          hasMore: true
        }
      };

      mockSearch.mockResolvedValue(mockResult);

      // Act
      await searchUsers(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockSetHeader).toHaveBeenCalledWith('X-Total-Count', '25');
      expect(mockSetHeader).toHaveBeenCalledWith(
        'Link',
        expect.stringContaining('rel="next"')
      );
    });
  });
});
