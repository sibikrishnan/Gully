/**
 * Integration Tests: User Profile Route (E2E)
 * Tests GET /api/users/:id endpoint with HTTP requests
 */

import request from 'supertest';
import app from '../../src/app';
import db from '../../src/shared/database/connection';
import { generateAccessToken } from '../../src/shared/utils/jwt.utils';

describe('GET /api/users/:id Route Integration', () => {
  let testUserId1: number;
  let testUserId2: number;
  let authToken1: string;

  beforeAll(async () => {
    // Insert test users
    const [user1] = await db('users')
      .insert({
        email: 'route-test1@example.com',
        password_hash: 'hash1',
        username: 'route_user1',
        full_name: 'Route User One',
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
        email: 'route-test2@example.com',
        password_hash: 'hash2',
        username: 'route_user2',
        full_name: 'Route User Two',
        phone_number: '+2222222222',
        skill_level: 'advanced',
        preferred_radius_km: 15,
        status: 'active',
      })
      .returning('*');
    testUserId2 = user2.id;

    // Add sport for user1
    await db('user_sports').insert({
      user_id: testUserId1,
      sport_name: 'pickleball',
      skill_level: 'intermediate',
    });
  });

  afterAll(async () => {
    // Cleanup
    await db('user_sports').where('user_id', testUserId1).del();
    await db('users').whereIn('id', [testUserId1, testUserId2]).del();
  });

  describe('Authentication', () => {
    it('should return 401 when no auth token provided', async () => {
      const response = await request(app).get(`/api/users/${testUserId1}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('authentication');
    });

    it('should return 401 when invalid auth token provided', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId1}`)
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('Validation', () => {
    it('should return 400 for invalid ID (non-numeric)', async () => {
      const response = await request(app)
        .get('/api/users/abc')
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Validation error');
    });

    it('should return 400 for negative ID', async () => {
      const response = await request(app)
        .get('/api/users/-5')
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Validation error');
    });

    it('should return 400 for ID=0', async () => {
      const response = await request(app)
        .get('/api/users/0')
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(400);
    });
  });

  describe('Own Profile Access', () => {
    it('should return 200 with email and phone_number for own profile', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId1}`)
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testUserId1);
      expect(response.body).toHaveProperty('email', 'route-test1@example.com');
      expect(response.body).toHaveProperty('phone_number', '+1111111111');
      expect(response.body).toHaveProperty('username', 'route_user1');
      expect(response.body).not.toHaveProperty('password_hash');
    });

    it('should include sports array for own profile', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId1}`)
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sports');
      expect(response.body.sports).toHaveLength(1);
      expect(response.body.sports[0].sport_name).toBe('pickleball');
    });
  });

  describe('Other Profile Access', () => {
    it('should return 200 WITHOUT email/phone_number for other profile', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId2}`)
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testUserId2);
      expect(response.body).toHaveProperty('username', 'route_user2');
      expect(response.body).toHaveProperty('full_name', 'Route User Two');
      expect(response.body).not.toHaveProperty('email');
      expect(response.body).not.toHaveProperty('phone_number');
      expect(response.body).not.toHaveProperty('password_hash');
    });

    it('should include sports array for other profile', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId2}`)
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sports');
      expect(response.body.sports).toEqual([]);
    });
  });

  describe('Not Found', () => {
    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/999999')
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('Response Format', () => {
    it('should return JSON with correct Content-Type', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId1}`)
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });
});
