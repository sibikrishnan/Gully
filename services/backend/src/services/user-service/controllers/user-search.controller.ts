/**
 * User Search Controller
 * Handles user search endpoint with filtering, ranking, and pagination
 */

import { Request, Response } from 'express';
import { UserSearchService } from '../services/user-search.service';
import { SearchParams } from '../schemas/user-search.schema';
import { SearchFilters } from '../repositories/user-search.repository';

const searchService = new UserSearchService();

/**
 * GET /api/users/search - Search users with filters and pagination
 * Processes query parameters, calls search service, and returns formatted results
 *
 * Query parameters:
 * - query: Optional text search for username/full_name
 * - location_city: Optional city filter
 * - sport: Optional array of sports (['pickleball', 'paddle'])
 * - skill_level: Optional skill level enum
 * - limit: Pagination limit (default 20, max 100)
 * - offset: Pagination offset (default 0, min 0)
 *
 * Response format:
 * {
 *   data: User[],
 *   pagination: {
 *     total: number,
 *     limit: number,
 *     offset: number,
 *     currentPage: number,
 *     totalPages: number,
 *     hasMore: boolean
 *   }
 * }
 *
 * Headers:
 * - X-Total-Count: Total number of results
 * - Link: Next/previous page links (if applicable)
 */
export async function searchUsers(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Extract and validate query parameters
    // Note: validation middleware should have already parsed this
    const validatedParams = req.query as unknown as SearchParams;

    // Build filters object
    const filters: SearchFilters = {
      query: validatedParams.query,
      location_city: validatedParams.location_city,
      sport: validatedParams.sport,
      skill_level: validatedParams.skill_level
    };

    // Build pagination object with defaults
    const pagination = {
      limit: validatedParams.limit ?? 20,
      offset: validatedParams.offset ?? 0
    };

    // Execute search via service
    const result = await searchService.search(filters, pagination);

    // Set pagination headers
    res.setHeader('X-Total-Count', result.pagination.total.toString());

    // Build Link header for pagination
    const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
    const linkHeader = buildLinkHeader(
      baseUrl,
      validatedParams,
      result.pagination.hasMore,
      result.pagination.offset,
      result.pagination.limit
    );

    if (linkHeader) {
      res.setHeader('Link', linkHeader);
    }

    // Return formatted response
    res.status(200).json(result);
  } catch (error: any) {
    // Handle validation errors
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
      return;
    }

    // Log and return server error
    console.error('Error in searchUsers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Build Link header for pagination navigation
 * Format: <url>; rel="next", <url>; rel="prev"
 *
 * @param baseUrl - Base URL for the endpoint
 * @param params - Current query parameters
 * @param hasMore - Whether there are more results
 * @param currentOffset - Current offset value
 * @param limit - Items per page
 * @returns Link header string or null if no links needed
 */
function buildLinkHeader(
  baseUrl: string,
  params: SearchParams,
  hasMore: boolean,
  currentOffset: number,
  limit: number
): string | null {
  const links: string[] = [];

  // Build query string helper
  const buildQueryString = (offset: number): string => {
    const queryParams = new URLSearchParams();

    if (params.query) queryParams.set('query', params.query);
    if (params.location_city) queryParams.set('location_city', params.location_city);
    if (params.sport) {
      if (Array.isArray(params.sport)) {
        params.sport.forEach(s => queryParams.append('sport', s));
      } else {
        queryParams.set('sport', params.sport);
      }
    }
    if (params.skill_level) queryParams.set('skill_level', params.skill_level);
    queryParams.set('limit', limit.toString());
    queryParams.set('offset', offset.toString());

    return queryParams.toString();
  };

  // Add next link if more results exist
  if (hasMore) {
    const nextOffset = currentOffset + limit;
    const nextQuery = buildQueryString(nextOffset);
    links.push(`<${baseUrl}?${nextQuery}>; rel="next"`);
  }

  // Add previous link if not on first page
  if (currentOffset > 0) {
    const prevOffset = Math.max(0, currentOffset - limit);
    const prevQuery = buildQueryString(prevOffset);
    links.push(`<${baseUrl}?${prevQuery}>; rel="prev"`);
  }

  return links.length > 0 ? links.join(', ') : null;
}
