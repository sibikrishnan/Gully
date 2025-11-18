/**
 * Integration Tests: POST/DELETE /api/users/:id/sports Routes
 * Tests middleware chain execution (auth, validation) and E2E user flows
 * P2-PROF-T4.3 - 4 MVP tests
 */

import request from 'supertest';
import app from '../../src/app';
import db from '../../src/shared/database/connection';
import { generateAccessToken } from '../../src/shared/utils/jwt.utils';

describe('POST/DELETE /api/users/:id/sports Routes', () => {
  let testUserId: number;
  let authToken: string;

  beforeAll(async () => {
    // Insert test user
    const [user] = await db('users')
      .insert({
        email: 'sports-routes-test@example.com',
        password_hash: 'hash123',
        username: 'sports_routes_user',
        full_name: 'Sports Routes Test User',
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
    // Cleanup: delete user_sports entries
    await db('user_sports').where({ user_id: testUserId }).del();
    // Cleanup: delete test user
    await db('users').where({ email: 'sports-routes-test@example.com' }).del();
    await db.destroy();
  });

  afterEach(async () => {
    // Cleanup sports after each test
    await db('user_sports').where({ user_id: testUserId }).del();
  });

  describe('Integration Tests: Middleware Chain', () => {
    /**
     * Integration Test 1: POST route - missing JWT returns 401
     * Verifies authentication middleware runs before controller
     */
    it('should return 401 when POST /api/users/:id/sports without JWT token', async () => {
      const response = await request(app)
        .post(`/api/users/${testUserId}/sports`)
        .send({
          sport_name: 'pickleball',
          skill_level: 'intermediate',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('authentication');
    });

    /**
     * Integration Test 2: POST route - invalid payload returns 400
     * Verifies validation middleware rejects invalid payloads before controller
     */
    it('should return 400 when POST /api/users/:id/sports with invalid payload', async () => {
      const response = await request(app)
        .post(`/api/users/${testUserId}/sports`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sport_name: 'invalid_sport', // Not in ['pickleball', 'paddle']
          skill_level: 'intermediate',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      // Validation middleware should catch this before controller
      expect(response.body.error.details).toBeDefined();
    });
  });

  describe('E2E Tests: Complete User Flow', () => {
    /**
     * E2E Test 1: Login → POST pickleball → GET profile → Verify sport in array
     * Tests complete flow of adding a sport and verifying it appears in user profile
     */
    it('should add pickleball sport and verify it appears in user profile', async () => {
      // Step 1: Add pickleball sport
      const addResponse = await request(app)
        .post(`/api/users/${testUserId}/sports`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sport_name: 'pickleball',
          skill_level: 'intermediate',
          years_experience: 3,
        });

      expect(addResponse.status).toBe(201);
      expect(addResponse.body).toHaveProperty('sport_name', 'pickleball');
      expect(addResponse.body).toHaveProperty('skill_level', 'intermediate');
      expect(addResponse.body).toHaveProperty('years_experience', 3);

      // Step 2: GET user profile
      const profileResponse = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body).toHaveProperty('sports');
      expect(Array.isArray(profileResponse.body.sports)).toBe(true);

      // Step 3: Verify pickleball is in sports array
      const pickleballSport = profileResponse.body.sports.find(
        (s: any) => s.sport_name === 'pickleball'
      );
      expect(pickleballSport).toBeDefined();
      expect(pickleballSport.skill_level).toBe('intermediate');
      expect(pickleballSport.years_experience).toBe(3);
    });

    /**
     * E2E Test 2: Login → POST paddle → DELETE paddle → GET profile → Verify removed
     * Tests complete flow of adding and removing a sport
     */
    it('should add paddle sport, remove it, and verify it is removed from profile', async () => {
      // Step 1: Add paddle sport
      const addResponse = await request(app)
        .post(`/api/users/${testUserId}/sports`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sport_name: 'paddle',
          skill_level: 'beginner',
          years_experience: 1,
        });

      expect(addResponse.status).toBe(201);
      expect(addResponse.body).toHaveProperty('sport_name', 'paddle');

      // Step 2: Verify paddle is in profile
      const profileBeforeDelete = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(profileBeforeDelete.status).toBe(200);
      const paddleSportBefore = profileBeforeDelete.body.sports.find(
        (s: any) => s.sport_name === 'paddle'
      );
      expect(paddleSportBefore).toBeDefined();

      // Step 3: DELETE paddle sport
      const deleteResponse = await request(app)
        .delete(`/api/users/${testUserId}/sports/paddle`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(204);
      expect(deleteResponse.body).toEqual({});

      // Step 4: GET user profile and verify paddle is removed
      const profileAfterDelete = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(profileAfterDelete.status).toBe(200);
      expect(profileAfterDelete.body).toHaveProperty('sports');

      // Verify paddle is NOT in sports array
      const paddleSportAfter = profileAfterDelete.body.sports.find(
        (s: any) => s.sport_name === 'paddle'
      );
      expect(paddleSportAfter).toBeUndefined();
    });
  });
});
