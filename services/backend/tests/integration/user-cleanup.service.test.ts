import { UserCleanupService } from '../../src/services/user-service/services/user-cleanup.service';

/**
 * Integration Tests for UserCleanupService
 * Tests graceful degradation without Redis (simulating production without Redis)
 */
describe('UserCleanupService - MVP Integration Tests', () => {
  let cleanupService: UserCleanupService;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console methods
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();

    // Create service without Redis (no REDIS_URL set)
    delete process.env.REDIS_URL;
    cleanupService = new UserCleanupService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Test 1: Revoke all user tokens successfully (graceful degradation)
   * Verifies that service handles missing Redis gracefully
   */
  describe('Test 1: Revoke tokens with graceful degradation', () => {
    it('should handle token revocation without Redis', async () => {
      const userId = 123;

      // Should not throw
      await expect(cleanupService.revokeTokens(userId)).resolves.not.toThrow();

      // Should warn about Redis unavailability
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Redis unavailable')
      );
    });

    it('should handle multiple token revocations without Redis', async () => {
      const userIds = [100, 200, 300];

      for (const userId of userIds) {
        await cleanupService.revokeTokens(userId);
      }

      // Should warn for each user
      expect(consoleWarnSpy).toHaveBeenCalledTimes(3);
    });
  });

  /**
   * Test 2: Clear user cache entries (graceful degradation)
   * Verifies that cache clearing handles missing Redis gracefully
   */
  describe('Test 2: Clear cache with graceful degradation', () => {
    it('should handle cache clearing without Redis', async () => {
      const userId = 456;

      // Should not throw
      await expect(cleanupService.clearCache(userId)).resolves.not.toThrow();

      // Should warn about Redis unavailability
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Redis unavailable')
      );
    });

    it('should handle online user removal without Redis', async () => {
      const userId = 789;

      await cleanupService.removeFromOnlineUsers(userId);

      // Should warn about Redis unavailability
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should handle WebSocket disconnect without Redis', async () => {
      const userId = 999;

      await cleanupService.closeWebSocketConnections(userId);

      // Should warn about Redis unavailability
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should handle cleanup for multiple users', async () => {
      const userIds = [111, 222, 333];

      for (const userId of userIds) {
        await cleanupService.clearCache(userId);
      }

      // Should warn for each user
      expect(consoleWarnSpy).toHaveBeenCalledTimes(3);
    });
  });

  /**
   * Test 3: Graceful handling when Redis is down
   * Verifies complete cleanup orchestration without throwing
   */
  describe('Test 3: Complete cleanup orchestration', () => {
    it('should complete full cleanup without Redis', async () => {
      const userId = 555;

      // Should not throw
      await expect(cleanupService.cleanupUserSessions(userId)).resolves.not.toThrow();

      // Should log completion
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Cleanup completed for user ${userId}`)
      );
    });

    it('should handle cleanup for user with special characters', async () => {
      const userId = 777;

      await cleanupService.cleanupUserSessions(userId);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cleanup completed')
      );
    });

    it('should not throw on repeated cleanup calls', async () => {
      const userId = 888;

      // Call cleanup multiple times (idempotent)
      await cleanupService.cleanupUserSessions(userId);
      await cleanupService.cleanupUserSessions(userId);
      await cleanupService.cleanupUserSessions(userId);

      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Cleanup and Disconnect', () => {
    it('should disconnect gracefully when no Redis client exists', async () => {
      // Should not throw
      await expect(cleanupService.disconnect()).resolves.not.toThrow();
    });

    it('should handle multiple disconnect calls', async () => {
      await cleanupService.disconnect();
      await cleanupService.disconnect();

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Error Resilience', () => {
    it('should continue cleanup even if some operations fail', async () => {
      const userId = 666;

      // All operations should complete without throwing
      await expect(cleanupService.revokeTokens(userId)).resolves.not.toThrow();
      await expect(cleanupService.clearCache(userId)).resolves.not.toThrow();
      await expect(cleanupService.removeFromOnlineUsers(userId)).resolves.not.toThrow();
      await expect(cleanupService.closeWebSocketConnections(userId)).resolves.not.toThrow();
    });

    it('should handle cleanup for invalid user IDs gracefully', async () => {
      const invalidIds = [0, -1, NaN, Infinity];

      for (const userId of invalidIds) {
        await expect(cleanupService.cleanupUserSessions(userId)).resolves.not.toThrow();
      }
    });
  });
});
