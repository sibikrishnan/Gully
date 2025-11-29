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
 * Handles GET /api/users/search: performs filtered, ranked user search and returns paginated results.
 *
 * Assumes validated query parameters are available on `req.query` and supports filters `query`, `location_city`, `sport`, and `skill_level`, plus pagination via `limit` and `offset`.
 *
 * Responds with 200 and a JSON object containing `data` and `pagination`; sets `X-Total-Count` and `Link` headers when applicable. Responds with 400 for validation failures and 500 for other server errors.
 */
export async function searchUsers(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Extract validated query parameters
    // Note: validation middleware has already validated and attached to req.query
    // Using type assertion here because Express Request typing doesn't know about our validation
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
 * Constructs an HTTP Link header for pagination with `next` and/or `prev` relations.
 *
 * Preserves current filter parameters from `params` (including repeated `sport` values)
 * and includes `limit` and `offset` for each generated link.
 *
 * @param baseUrl - Endpoint base URL (scheme, host, and path)
 * @param params - Validated query parameters to preserve in generated links
 * @param hasMore - Whether a `next` link should be included
 * @param currentOffset - Current offset value used to calculate `prev` and `next`
 * @param limit - Number of items per page included in generated links
 * @returns The formatted Link header value (e.g., `<...>; rel="next", <...>; rel="prev"`) or `null` if no links are needed
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