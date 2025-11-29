/**
 * E2E Tests: PATCH /api/users/:id CORS Handling
 * Tests CORS preflight and headers for cross-origin requests
 */

import request from 'supertest';
import app from '../../src/app';
import db from '../../src/shared/database/connection';
import { generateAccessToken } from '../../src/shared/utils/jwt.utils';

describe('PATCH /api/users/:id CORS E2E Tests', () => {
  let testUserId: number;
  let authToken: string;

  beforeAll(async () => {
    // Insert test user
    const [user] = await db('users')
      .insert({
        email: 'cors-test@example.com',
        password_hash: 'hash123',
        username: 'cors_user',
        full_name: 'CORS Test User',
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
    await db('users').where({ email: 'cors-test@example.com' }).del();
    await db.destroy();
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in PATCH response', async () => {
      const response = await request(app)
        .patch(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Origin', 'http://localhost:3001')
        .send({ full_name: 'CORS Updated Name' });

      expect(response.status).toBe(200);
      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3001');
    });

    it('should handle OPTIONS preflight request for PATCH with proper CORS headers', async () => {
      const response = await request(app)
        .options(`/api/users/${testUserId}`)
        .set('Origin', 'http://localhost:3001')
        .set('Access-Control-Request-Method', 'PATCH')
        .set('Access-Control-Request-Headers', 'authorization,content-type');

      // Preflight should return 204 (No Content) or 200
      expect([200, 204]).toContain(response.status);
      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
    });
  });
});
