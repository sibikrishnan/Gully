import { User } from '../../../shared/types/auth.types';

/**
 * UserRankingService
 * Handles relevance scoring and ranking of search results
 */
export class UserRankingService {
  /**
   * Calculate relevance score for a user based on search query
   * Higher scores indicate better matches
   *
   * Scoring logic:
   * - Exact username match: +100
   * - Partial username match: +50
   * - Exact full_name match: +80
   * - Partial full_name match: +40
   * - Recently active (last 30 days): +10
   *
   * @param user - User object
   * @param searchQuery - Search query string
   * @returns Relevance score (higher is better)
   */
  calculateRelevance(
    user: Omit<User, 'password_hash'>,
    searchQuery?: string
  ): number {
    // If no search query, all users have equal relevance
    if (!searchQuery || searchQuery.trim() === '') {
      return 0;
    }

    let score = 0;
    const queryLower = searchQuery.toLowerCase().trim();

    // Username scoring
    if (user.username) {
      const usernameLower = user.username.toLowerCase();
      if (usernameLower === queryLower) {
        score += 100; // Exact match
      } else if (usernameLower.includes(queryLower)) {
        score += 50; // Partial match
      }
    }

    // Full name scoring
    if (user.full_name) {
      const fullNameLower = user.full_name.toLowerCase();
      if (fullNameLower === queryLower) {
        score += 80; // Exact match
      } else if (fullNameLower.includes(queryLower)) {
        score += 40; // Partial match
      }
    }

    // Recently active boost
    if (user.last_login_at) {
      const daysSinceLogin = Math.floor(
        (Date.now() - new Date(user.last_login_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLogin <= 30) {
        score += 10;
      }
    }

    return score;
  }

  /**
   * Sort users by relevance score
   * Falls back to created_at DESC for users with identical scores
   *
   * @param users - Array of users
   * @param searchQuery - Search query string
   * @returns Sorted array of users (highest relevance first)
   */
  sortByRelevance(
    users: Omit<User, 'password_hash'>[],
    searchQuery?: string
  ): Omit<User, 'password_hash'>[] {
    // If no search query, return users as-is (already ordered by created_at DESC from query)
    if (!searchQuery || searchQuery.trim() === '') {
      return users;
    }

    // Calculate relevance for each user and sort
    const usersWithScores = users.map(user => ({
      user,
      score: this.calculateRelevance(user, searchQuery)
    }));

    usersWithScores.sort((a, b) => {
      // Primary sort: relevance score (descending)
      if (a.score !== b.score) {
        return b.score - a.score;
      }

      // Fallback sort: created_at (descending - newest first)
      const aDate = new Date(a.user.created_at || 0).getTime();
      const bDate = new Date(b.user.created_at || 0).getTime();
      return bDate - aDate;
    });

    return usersWithScores.map(item => item.user);
  }
}
