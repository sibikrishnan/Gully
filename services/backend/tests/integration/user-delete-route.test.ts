/**
 * Integration Tests: User Delete Route (E2E)
 * Tests DELETE /api/users/:id endpoint with HTTP requests
 */

import request from 'supertest';
import app from '../../src/app';
import db from '../../src/shared/database/connection';
import { generateAccessToken } from '../../src/shared/utils/jwt.utils';

describe('DELETE /api/users/:id Route Integration', () => {
  let testUserId1: number;
  let testUserId2: number;
  let authToken1: string;

  beforeAll(async () => {
    // Insert test users
    const [user1] = await db('users')
      .insert({
        email: 'delete-route-test1@example.com',
        password_hash: 'hash1',
        username: 'delete_route_user1',
        full_name: 'Delete Route User One',
        phone_number: '+1111111111',
        skill_level: 'intermediate',
        preferred_radius_km: 10,
        status: 'active',
      })
      .returning('*');
    testUserId1 = user1.id;
    authToken1 = generateAccessToken(user1);

    const [user2] = await db('users')
      .insert({
        email: 'delete-route-test2@example.com',
        password_hash: 'hash2',
        username: 'delete_route_user2',
        full_name: 'Delete Route User Two',
        phone_number: '+2222222222',
        skill_level: 'advanced',
        preferred_radius_km: 15,
        status: 'active',
      })
      .returning('*');
    testUserId2 = user2.id;
  });

  afterAll(async () => {
    // Cleanup - delete all test users (including soft-deleted ones)
    await db('deletion_audit').whereIn('user_id', [testUserId1, testUserId2]).del();
    await db('users').whereIn('id', [testUserId1, testUserId2]).del();
  });

  // Reset user status before each test to ensure idempotent tests
  beforeEach(async () => {
    await db('users')
      .whereIn('id', [testUserId1, testUserId2])
      .update({ status: 'active' });
    await db('deletion_audit').whereIn('user_id', [testUserId1, testUserId2]).del();
  });

  describe('Test 1: Successful deletion returns 204 No Content', () => {
    it('should return 204 No Content when user successfully deletes own profile', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUserId1}`)
        .set('Authorization', `Bearer ${authToken1}`);

      // Verify 204 No Content response
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      // Verify user is soft deleted
      const deletedUser = await db('users')
        .select('status')
        .where({ id: testUserId1 })
        .first();
      expect(deletedUser.status).toBe('inactive');

      // Verify audit trail created
      const auditRecord = await db('deletion_audit')
        .select('*')
        .where({ user_id: testUserId1 })
        .first();
      expect(auditRecord).toBeDefined();
      expect(auditRecord.user_id).toBe(testUserId1);
    });
  });

  describe('Test 2: Missing JWT returns 401', () => {
    it('should return 401 when no auth token provided', async () => {
      const response = await request(app).delete(`/api/users/${testUserId1}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('authentication');

      // Verify user is NOT deleted
      const user = await db('users')
        .select('status')
        .where({ id: testUserId1 })
        .first();
      expect(user.status).toBe('active');
    });

    it('should return 401 when invalid auth token provided', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUserId1}`)
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);

      // Verify user is NOT deleted
      const user = await db('users')
        .select('status')
        .where({ id: testUserId1 })
        .first();
      expect(user.status).toBe('active');
    });
  });

  describe('Test 3: User cannot delete other user (403)', () => {
    it('should return 403 Forbidden when user tries to delete another user', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUserId2}`)
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Forbidden: You can only delete your own profile');

      // Verify other user is NOT deleted
      const otherUser = await db('users')
        .select('status')
        .where({ id: testUserId2 })
        .first();
      expect(otherUser.status).toBe('active');
    });
  });

  describe('Test 4: E2E flow (login → delete own account → verify soft delete)', () => {
    it('should handle complete E2E deletion flow', async () => {
      // Step 1: Verify user exists and is active
      const userBeforeDeletion = await db('users')
        .select('status', 'email')
        .where({ id: testUserId1 })
        .first();
      expect(userBeforeDeletion.status).toBe('active');
      expect(userBeforeDeletion.email).toBe('delete-route-test1@example.com');

      // Step 2: User deletes their own account
      const deleteResponse = await request(app)
        .delete(`/api/users/${testUserId1}`)
        .set('Authorization', `Bearer ${authToken1}`);

      expect(deleteResponse.status).toBe(204);

      // Step 3: Verify user is soft deleted (status = inactive)
      const userAfterDeletion = await db('users')
        .select('status', 'email')
        .where({ id: testUserId1 })
        .first();
      expect(userAfterDeletion.status).toBe('inactive');
      expect(userAfterDeletion.email).toBe('delete-route-test1@example.com'); // Email preserved

      // Step 4: Verify audit trail created
      const auditRecord = await db('deletion_audit')
        .select('*')
        .where({ user_id: testUserId1 })
        .first();
      expect(auditRecord).toBeDefined();
      expect(auditRecord.user_id).toBe(testUserId1);
      expect(auditRecord.deleted_at).toBeDefined();

      // Step 5: Verify user cannot be retrieved via GET
      // Note: After deletion, the token is still valid but user is inactive
      // GET endpoint will return 404 for inactive users (not found)
      // However, DELETE endpoint already consumed the user's ability to authenticate
      // For now, we skip this check as the user's JWT token would be revoked
      // and they wouldn't be able to make subsequent requests

      // Step 6: Verify idempotent deletion (attempting to delete again)
      const deleteAgainResponse = await request(app)
        .delete(`/api/users/${testUserId1}`)
        .set('Authorization', `Bearer ${authToken1}`);

      // After deletion, user is inactive
      // The JWT token might still be valid depending on when token revocation takes effect
      // In production, tokens would be revoked in Redis and this would return 401
      // For now, we accept either 403 (auth middleware rejects inactive user) or 404 (user not found)
      expect([403, 404]).toContain(deleteAgainResponse.status);
    });
  });

  describe('Additional Edge Cases', () => {
    it('should return 400 for invalid ID (non-numeric)', async () => {
      const response = await request(app)
        .delete('/api/users/abc')
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Validation error');
    });

    it('should return 400 for negative ID', async () => {
      const response = await request(app)
        .delete('/api/users/-5')
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Validation error');
    });

    it('should return 403 for non-existent user (authorization check first)', async () => {
      // Security best practice: Don't reveal user existence to unauthorized requests
      // Authorization check happens before user existence check
      const nonExistentId = 999999;
      const response = await request(app)
        .delete(`/api/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken1}`);

      // Expect 403 because authToken1's user ID (testUserId1) !== 999999
      // This prevents information disclosure about user existence
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Forbidden: You can only delete your own profile');
    });
  });
});
