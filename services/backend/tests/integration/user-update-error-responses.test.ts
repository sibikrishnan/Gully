/**
 * Integration Tests: PATCH /api/users/:id Error Response Formatting
 * Tests HTTP error responses and status codes
 */

import request from 'supertest';
import app from '../../src/app';
import db from '../../src/shared/database/connection';
import { generateAccessToken } from '../../src/shared/utils/jwt.utils';
import jwt from 'jsonwebtoken';

describe('PATCH /api/users/:id Error Response Formatting', () => {
  let testUserId1: number;
  let testUserId2: number;
  let authToken1: string;

  beforeAll(async () => {
    // Insert test users
    const [user1] = await db('users')
      .insert({
        email: 'error-test1@example.com',
        password_hash: 'hash123',
        username: 'error_user1',
        full_name: 'Error Test User 1',
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
        email: 'error-test2@example.com',
        password_hash: 'hash456',
        username: 'error_user2',
        full_name: 'Error Test User 2',
        phone_number: '+2222222222',
        skill_level: 'advanced',
        preferred_radius_km: 15,
        status: 'active',
      })
      .returning('*');
    testUserId2 = user2.id;
  });

  afterAll(async () => {
    // Cleanup test users
    await db('users').whereIn('email', ['error-test1@example.com', 'error-test2@example.com']).del();
    await db.destroy();
  });

  describe('401 Unauthorized Errors', () => {
    it('should return 401 for missing Authorization header', async () => {
      const response = await request(app)
        .patch(`/api/users/${testUserId1}`)
        .send({ full_name: 'Updated Name' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('authentication');
    });

    it('should return 401 for invalid JWT token', async () => {
      const response = await request(app)
        .patch(`/api/users/${testUserId1}`)
        .set('Authorization', 'Bearer invalid_token_here')
        .send({ full_name: 'Updated Name' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 401 for expired JWT token', async () => {
      // Generate expired token (expired 1 hour ago)
      const expiredToken = jwt.sign(
        { userId: testUserId1 },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .patch(`/api/users/${testUserId1}`)
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({ full_name: 'Updated Name' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('400 Bad Request Errors', () => {
    it('should return 400 for invalid :id parameter (non-integer)', async () => {
      const response = await request(app)
        .patch('/api/users/not-a-number')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ full_name: 'Updated Name' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.details).toBeDefined();
    });

    it('should return 400 for invalid request body with Zod error details', async () => {
      const response = await request(app)
        .patch(`/api/users/${testUserId1}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ skill_level: 'invalid_skill_level' }); // Invalid enum

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.details).toBeDefined();
      expect(Array.isArray(response.body.error.details)).toBe(true);
    });
  });

  describe('403 Forbidden Errors', () => {
    it('should return 403 for unauthorized profile update (other user)', async () => {
      // User 1 tries to update User 2's profile
      const response = await request(app)
        .patch(`/api/users/${testUserId2}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ full_name: 'Trying to Update Other User' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Forbidden');
    });
  });

  describe('404 Not Found Errors', () => {
    it('should return 401 for non-existent user in auth middleware', async () => {
      // Create a token for a non-existent user ID
      const nonExistentUserId = 999999;
      const fakeToken = jwt.sign(
        { userId: nonExistentUserId },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .patch(`/api/users/${nonExistentUserId}`)
        .set('Authorization', `Bearer ${fakeToken}`)
        .send({ full_name: 'Updated Name' });

      // Auth middleware will return 401 when user not found in database
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });
});
