// Redis client type (optional dependency)
type RedisClient = any;

/**
 * UserCleanupService
 * Handles post-deletion cleanup for user accounts
 * Revokes tokens, clears cache, removes from online tracking, closes WebSocket connections
 */
export class UserCleanupService {
  private redisClient: RedisClient | null = null;

  constructor() {
    // Initialize Redis client (optional - graceful degradation if unavailable)
    this.initializeRedis();
  }

  /**
   * Initialize Redis client with error handling
   * Gracefully degrades if Redis is unavailable
   */
  private async initializeRedis(): Promise<void> {
    try {
      // Only initialize if Redis config exists and module is available
      if (process.env.REDIS_URL) {
        // Dynamically import redis (optional dependency)
        // @ts-ignore - Redis is an optional dependency
        const { createClient } = await import('redis');

        this.redisClient = createClient({
          url: process.env.REDIS_URL,
        });

        this.redisClient.on('error', (err: Error) => {
          console.error('Redis client error:', err);
          this.redisClient = null;
        });

        await this.redisClient.connect();
      }
    } catch (error) {
      console.warn('Redis initialization failed, continuing without cache:', error);
      this.redisClient = null;
    }
  }

  /**
   * Main cleanup method - orchestrates all cleanup operations
   * Handles errors gracefully - logs but doesn't throw
   * @param userId - User ID to clean up
   */
  async cleanupUserSessions(userId: number): Promise<void> {
    try {
      // Execute cleanup operations in parallel (non-blocking)
      await Promise.allSettled([
        this.revokeTokens(userId),
        this.clearCache(userId),
        this.removeFromOnlineUsers(userId),
        this.closeWebSocketConnections(userId),
      ]);

      console.log(`Cleanup completed for user ${userId}`);
    } catch (error) {
      // Log but don't throw - cleanup failures should not block deletion
      console.error(`Error during cleanup for user ${userId}:`, error);
    }
  }

  /**
   * Revoke all JWT tokens for user
   * Adds user ID to token revocation list in Redis
   * @param userId - User ID
   */
  async revokeTokens(userId: number): Promise<void> {
    try {
      if (!this.redisClient) {
        console.warn(`Redis unavailable, cannot revoke tokens for user ${userId}`);
        return;
      }

      // Add user to revoked tokens set
      const key = `revoked_tokens:user:${userId}`;
      await this.redisClient.set(key, Date.now().toString(), {
        EX: 60 * 60 * 24 * 7, // 7 days expiry
      });

      // Also add to global revocation list
      await this.redisClient.sAdd('revoked_users', userId.toString());

      console.log(`Revoked tokens for user ${userId}`);
    } catch (error) {
      console.error(`Failed to revoke tokens for user ${userId}:`, error);
      // Don't throw - graceful degradation
    }
  }

  /**
   * Clear all Redis cache entries for user
   * Removes user profile, preferences, and session data
   * @param userId - User ID
   */
  async clearCache(userId: number): Promise<void> {
    try {
      if (!this.redisClient) {
        console.warn(`Redis unavailable, cannot clear cache for user ${userId}`);
        return;
      }

      // Clear various cache keys
      const keysToDelete = [
        `user:${userId}:profile`,
        `user:${userId}:preferences`,
        `user:${userId}:session`,
        `user:${userId}:sports`,
        `user:${userId}:teams`,
      ];

      // Delete all keys
      const deleted = await this.redisClient.del(keysToDelete);
      console.log(`Cleared ${deleted} cache entries for user ${userId}`);
    } catch (error) {
      console.error(`Failed to clear cache for user ${userId}:`, error);
      // Don't throw - graceful degradation
    }
  }

  /**
   * Remove user from online users tracking
   * Removes from Redis sorted set of online users
   * @param userId - User ID
   */
  async removeFromOnlineUsers(userId: number): Promise<void> {
    try {
      if (!this.redisClient) {
        console.warn(`Redis unavailable, cannot remove from online users for user ${userId}`);
        return;
      }

      // Remove from online users sorted set
      await this.redisClient.zRem('online_users', userId.toString());

      // Remove from active sessions hash
      await this.redisClient.hDel('active_sessions', userId.toString());

      console.log(`Removed user ${userId} from online tracking`);
    } catch (error) {
      console.error(`Failed to remove from online users for user ${userId}:`, error);
      // Don't throw - graceful degradation
    }
  }

  /**
   * Close active WebSocket connections for user
   * Publishes disconnection event to WebSocket server
   * @param userId - User ID
   */
  async closeWebSocketConnections(userId: number): Promise<void> {
    try {
      if (!this.redisClient) {
        console.warn(`Redis unavailable, cannot close WebSocket for user ${userId}`);
        return;
      }

      // Publish disconnect event to WebSocket server via Redis pub/sub
      await this.redisClient.publish(
        'websocket:disconnect',
        JSON.stringify({
          userId,
          reason: 'user_deleted',
          timestamp: Date.now(),
        })
      );

      console.log(`Sent WebSocket disconnect event for user ${userId}`);
    } catch (error) {
      console.error(`Failed to close WebSocket for user ${userId}:`, error);
      // Don't throw - graceful degradation
    }
  }

  /**
   * Gracefully disconnect Redis client
   * Called on application shutdown
   */
  async disconnect(): Promise<void> {
    try {
      if (this.redisClient) {
        await this.redisClient.quit();
        this.redisClient = null;
      }
    } catch (error) {
      console.error('Error disconnecting Redis client:', error);
    }
  }
}

// Export singleton instance
export const userCleanupService = new UserCleanupService();
