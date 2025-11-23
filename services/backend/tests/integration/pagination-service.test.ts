/**
 * Integration Tests for Pagination Service
 * Tests paginateResults, calculatePageInfo, and pagination consistency
 */

import { PaginationService } from '../../src/services/user-service/services/pagination.service';

describe('Pagination Service Integration', () => {
  let paginationService: PaginationService;

  beforeEach(() => {
    paginationService = new PaginationService();
  });

  describe('paginateResults - First Page', () => {
    it('should return correct first page items (limit=10, offset=0)', () => {
      const mockItems = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }));
      const total = 50;

      const result = paginationService.paginateResults(mockItems, total, 10, 0);

      expect(result.data).toHaveLength(10);
      expect(result.data[0]).toEqual({ id: 1, name: 'User 1' });
      expect(result.data[9]).toEqual({ id: 10, name: 'User 10' });
      expect(result.pagination.total).toBe(50);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.offset).toBe(0);
    });

    it('should include pagination metadata with hasMore=true', () => {
      const mockItems = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
      const total = 50;

      const result = paginationService.paginateResults(mockItems, total, 10, 0);

      expect(result.pagination).toEqual({
        total: 50,
        limit: 10,
        offset: 0,
        currentPage: 1,
        totalPages: 5,
        hasMore: true
      });
    });

    it('should handle single page results (hasMore=false)', () => {
      const mockItems = Array.from({ length: 5 }, (_, i) => ({ id: i + 1 }));
      const total = 5;

      const result = paginationService.paginateResults(mockItems, total, 10, 0);

      expect(result.pagination.hasMore).toBe(false);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.currentPage).toBe(1);
    });

    it('should handle empty results', () => {
      const mockItems: any[] = [];
      const total = 0;

      const result = paginationService.paginateResults(mockItems, total, 10, 0);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.hasMore).toBe(false);
      expect(result.pagination.totalPages).toBe(0);
    });
  });

  describe('paginateResults - Next Page (with offset)', () => {
    it('should return next page correctly (items 11-20)', () => {
      const mockItems = Array.from({ length: 10 }, (_, i) => ({ id: i + 11, name: `User ${i + 11}` }));
      const total = 50;

      const result = paginationService.paginateResults(mockItems, total, 10, 10);

      expect(result.data).toHaveLength(10);
      expect(result.data[0]).toEqual({ id: 11, name: 'User 11' });
      expect(result.data[9]).toEqual({ id: 20, name: 'User 20' });
      expect(result.pagination.offset).toBe(10);
      expect(result.pagination.currentPage).toBe(2);
    });

    it('should set hasMore flag accurately for last page', () => {
      // Last page with 10 items (offset=40, total=50)
      const mockItems = Array.from({ length: 10 }, (_, i) => ({ id: i + 41 }));
      const total = 50;

      const result = paginationService.paginateResults(mockItems, total, 10, 40);

      expect(result.pagination.hasMore).toBe(false);
      expect(result.pagination.currentPage).toBe(5);
      expect(result.pagination.totalPages).toBe(5);
    });

    it('should handle offset beyond total results', () => {
      const mockItems: any[] = [];
      const total = 50;

      const result = paginationService.paginateResults(mockItems, total, 10, 100);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.hasMore).toBe(false);
      expect(result.pagination.currentPage).toBe(11); // offset 100 / limit 10 + 1
    });

    it('should handle last page with partial results', () => {
      const mockItems = Array.from({ length: 5 }, (_, i) => ({ id: i + 46 }));
      const total = 50;

      const result = paginationService.paginateResults(mockItems, total, 10, 45);

      expect(result.data).toHaveLength(5);
      expect(result.pagination.hasMore).toBe(false);
      expect(result.pagination.totalPages).toBe(5);
    });
  });

  describe('calculatePageInfo - Total Count Accuracy', () => {
    it('should return accurate total count matching filtered results', () => {
      const pageInfo = paginationService.calculatePageInfo(137, 20, 0);

      expect(pageInfo.total).toBe(137);
      expect(pageInfo.limit).toBe(20);
      expect(pageInfo.offset).toBe(0);
    });

    it('should compute currentPage and totalPages correctly', () => {
      // Page 1 (offset=0, limit=20, total=137)
      const page1 = paginationService.calculatePageInfo(137, 20, 0);
      expect(page1.currentPage).toBe(1);
      expect(page1.totalPages).toBe(7); // ceil(137/20) = 7

      // Page 3 (offset=40, limit=20, total=137)
      const page3 = paginationService.calculatePageInfo(137, 20, 40);
      expect(page3.currentPage).toBe(3);
      expect(page3.totalPages).toBe(7);

      // Last page (offset=120, limit=20, total=137)
      const lastPage = paginationService.calculatePageInfo(137, 20, 120);
      expect(lastPage.currentPage).toBe(7);
      expect(lastPage.totalPages).toBe(7);
      expect(lastPage.hasMore).toBe(false);
    });

    it('should handle total count of 0', () => {
      const pageInfo = paginationService.calculatePageInfo(0, 20, 0);

      expect(pageInfo.total).toBe(0);
      expect(pageInfo.totalPages).toBe(0);
      expect(pageInfo.hasMore).toBe(false);
    });

    it('should prevent division by zero with limit=0', () => {
      const pageInfo = paginationService.calculatePageInfo(100, 0, 0);

      // Service should use safeLimit=1 to prevent division by zero
      expect(pageInfo.totalPages).toBeGreaterThanOrEqual(0);
      expect(pageInfo.currentPage).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Pagination Consistency - Ordering Across Pages', () => {
    it('should maintain consistent ordering across multiple pages', () => {
      const total = 30;

      // Page 1
      const page1Items = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, position: i }));
      const page1 = paginationService.paginateResults(page1Items, total, 10, 0);

      // Page 2
      const page2Items = Array.from({ length: 10 }, (_, i) => ({ id: i + 11, position: i + 10 }));
      const page2 = paginationService.paginateResults(page2Items, total, 10, 10);

      // Page 3
      const page3Items = Array.from({ length: 10 }, (_, i) => ({ id: i + 21, position: i + 20 }));
      const page3 = paginationService.paginateResults(page3Items, total, 10, 20);

      // Verify no duplicates across pages
      const allIds = [
        ...page1.data.map(u => u.id),
        ...page2.data.map(u => u.id),
        ...page3.data.map(u => u.id)
      ];
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(30); // No duplicates

      // Verify no gaps (sequential IDs)
      expect(allIds).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
    });

    it('should maintain same order with different offsets', () => {
      const total = 50;

      // Simulate fetching overlapping windows
      const offset1Items = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
      const result1 = paginationService.paginateResults(offset1Items, total, 10, 0);

      const offset2Items = Array.from({ length: 10 }, (_, i) => ({ id: i + 6 }));
      const result2 = paginationService.paginateResults(offset2Items, total, 10, 5);

      // Items 6-10 should appear in both results in the same order
      const overlap1 = result1.data.slice(5); // IDs 6-10
      const overlap2 = result2.data.slice(0, 5); // IDs 6-10

      expect(overlap1).toEqual(overlap2);
    });

    it('should handle deterministic ordering with identical values', () => {
      // All items have same timestamp - should maintain stable order
      const items = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        timestamp: '2024-01-01T00:00:00Z' // Identical timestamps
      }));

      const result = paginationService.paginateResults(items, 100, 10, 0);

      // Order should be deterministic (by ID since timestamps are equal)
      expect(result.data.map(u => u.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });
});
