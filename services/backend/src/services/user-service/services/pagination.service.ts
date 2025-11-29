/**
 * Pagination Service
 * Provides utility functions for consistent pagination across the application
 */

export interface PageInfo {
  total: number;
  limit: number;
  offset: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PageInfo;
}

/**
 * PaginationService
 * Handles pagination logic and metadata calculation
 */
export class PaginationService {
  /**
   * Paginate results with metadata
   *
   * @param items - Array of items (already sliced/limited by database query)
   * @param total - Total count of all items (before pagination)
   * @param limit - Items per page
   * @param offset - Number of items to skip
   * @returns Paginated response with data and pagination metadata
   */
  paginateResults<T>(
    items: T[],
    total: number,
    limit: number,
    offset: number
  ): PaginatedResponse<T> {
    const pageInfo = this.calculatePageInfo(total, limit, offset);

    return {
      data: items,
      pagination: pageInfo
    };
  }

  /**
   * Calculate pagination metadata
   *
   * @param total - Total count of all items
   * @param limit - Items per page
   * @param offset - Number of items to skip
   * @returns Page info with current page, total pages, and hasMore flag
   */
  calculatePageInfo(total: number, limit: number, offset: number): PageInfo {
    // Prevent division by zero
    const safeLimit = Math.max(1, limit);

    // Calculate current page (1-indexed)
    const currentPage = Math.floor(offset / safeLimit) + 1;

    // Calculate total pages
    const totalPages = Math.ceil(total / safeLimit);

    // Check if there are more items after current page
    const hasMore = offset + limit < total;

    return {
      total,
      limit,
      offset,
      currentPage,
      totalPages: Math.max(0, totalPages), // Ensure non-negative
      hasMore
    };
  }
}
