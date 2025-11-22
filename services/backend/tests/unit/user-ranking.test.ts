/**
 * Unit Tests: User Ranking Service
 * Tests relevance scoring and sorting logic
 */

import { UserRankingService } from '../../src/services/user-service/services/user-ranking.service';
import { User } from '../../src/shared/types/auth.types';

describe('User Ranking Service', () => {
  const rankingService = new UserRankingService();

  // Helper to create mock user
  const createMockUser = (
    id: number,
    username: string,
    full_name: string,
    last_login_at?: Date
  ): Omit<User, 'password_hash'> => ({
    id,
    email: `user${id}@example.com`,
    username,
    full_name,
    phone_number: undefined,
    skill_level: 'intermediate',
    location_lat: undefined,
    location_lng: undefined,
    location_name: undefined,
    preferred_radius_km: 10,
    profile_image_url: undefined,
    status: 'active',
    last_login_at: last_login_at || undefined,
    created_at: new Date(),
    updated_at: new Date(),
  });

  describe('calculateRelevance', () => {
    it('should give highest score to exact username match', () => {
      const user = createMockUser(1, 'pickleball', 'John Doe');

      const score = rankingService.calculateRelevance(user, 'pickleball');

      expect(score).toBe(100); // Exact username match
    });

    it('should give lower score to partial username match', () => {
      const user = createMockUser(1, 'pickleballfan', 'John Doe');

      const score = rankingService.calculateRelevance(user, 'pickleball');

      expect(score).toBe(50); // Partial username match
    });

    it('should score exact full_name match lower than username', () => {
      const user = createMockUser(1, 'user123', 'Pickleball Master');

      const score = rankingService.calculateRelevance(user, 'pickleball master');

      expect(score).toBe(80); // Exact full_name match
    });

    it('should boost recently active users (last 30 days)', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 10); // 10 days ago
      const user = createMockUser(1, 'pickleballplayer', 'John Doe', recentDate);

      const score = rankingService.calculateRelevance(user, 'pickle');

      expect(score).toBe(60); // 50 (partial) + 10 (recent login)
    });

    it('should not boost users with old last_login_at', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 60); // 60 days ago
      const user = createMockUser(1, 'pickleballplayer', 'John Doe', oldDate);

      const score = rankingService.calculateRelevance(user, 'pickle');

      expect(score).toBe(50); // 50 (partial), no boost
    });

    it('should return 0 for empty search query', () => {
      const user = createMockUser(1, 'pickleball', 'John Doe');

      const score = rankingService.calculateRelevance(user, '');

      expect(score).toBe(0);
    });
  });

  describe('sortByRelevance', () => {
    it('should rank exact username match higher than partial match', () => {
      const users = [
        createMockUser(1, 'pickleballfan', 'User One'),
        createMockUser(2, 'pickleball', 'User Two'),
        createMockUser(3, 'pickle_player', 'User Three'),
      ];

      const sorted = rankingService.sortByRelevance(users, 'pickleball');

      expect(sorted[0].username).toBe('pickleball'); // Exact match (100)
      expect(sorted[1].username).toBe('pickleballfan'); // Partial match (50)
      expect(sorted[2].username).toBe('pickle_player'); // Partial match (50)
    });

    it('should use created_at as fallback for identical relevance scores', () => {
      const oldDate = new Date('2023-01-01');
      const newDate = new Date('2024-01-01');

      const users = [
        { ...createMockUser(1, 'player1', 'User One'), created_at: oldDate },
        { ...createMockUser(2, 'player2', 'User Two'), created_at: newDate },
      ];

      const sorted = rankingService.sortByRelevance(users, 'test'); // No match, both score 0

      expect(sorted[0].created_at).toEqual(newDate); // Newer user first
      expect(sorted[1].created_at).toEqual(oldDate);
    });

    it('should return users as-is when no search query provided', () => {
      const users = [
        createMockUser(1, 'user1', 'User One'),
        createMockUser(2, 'user2', 'User Two'),
      ];

      const sorted = rankingService.sortByRelevance(users, '');

      expect(sorted).toEqual(users); // No sorting applied
    });

    it('should handle empty user array', () => {
      const users: Omit<User, 'password_hash'>[] = [];

      const sorted = rankingService.sortByRelevance(users, 'test');

      expect(sorted).toEqual([]);
    });
  });
});
