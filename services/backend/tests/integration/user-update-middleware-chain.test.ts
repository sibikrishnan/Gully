/**
 * Integration Tests: PATCH /api/users/:id Middleware Chain
 * Tests middleware execution order and error handling propagation
 */

import request from 'supertest';
import app from '../../src/app';
import db from '../../src/shared/database/connection';
import { generateAccessToken } from '../../src/shared/utils/jwt.utils';

describe('PATCH /api/users/:id Middleware Chain Integration', () => {
  let testUserId: number;
  let authToken: string;

  beforeAll(async () => {
    // Insert test user
    const [user] = await db('users')
      .insert({
        email: 'middleware-test@example.com',
        password_hash: 'hash123',
        username: 'middleware_user',
        full_name: 'Middleware Test User',
        phone_number: '+1234567890',
        skill_level: 'intermediate',
        preferred_radius_km: 10,
        status: 'active',
      })
      .returning('*');
    testUserId = user.id;
    authToken = generateAccessToken(user);
  });

  afterAll(async () => {
    // Cleanup test users
    await db('users').where({ email: 'middleware-test@example.com' }).del();
    await db.destroy();
  });

  describe('Middleware Execution Order', () => {
    it('should execute authenticate middleware before validation middleware', async () => {
      // Missing Authorization header should fail at authenticate middleware
      // before validation middleware can run
      const response = await request(app)
        .patch(`/api/users/${testUserId}`)
        .send({ full_name: 'Updated Name' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      // Should fail with auth error, not validation error
      expect(response.body.error).toContain('authentication');
    });

    it('should execute param validation before body validation', async () => {
      // Invalid :id parameter should fail before body validation
      const response = await request(app)
        .patch('/api/users/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ invalid_field: 'test' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      // Should fail with param validation error
      expect(response.body.error.details).toBeDefined();
    });

    it('should execute body validation before controller', async () => {
      // Invalid body should fail at validation middleware
      const response = await request(app)
        .patch(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ skill_level: 'invalid_skill' }); // Invalid enum value

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.details).toBeDefined();
    });

    it('should populate req.user in authenticate middleware and pass to controller', async () => {
      // Valid request should pass through all middleware and reach controller
      const response = await request(app)
        .patch(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ full_name: 'Successfully Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('full_name', 'Successfully Updated Name');
      // Controller successfully used req.user for authorization
    });
  });
});
