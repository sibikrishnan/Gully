/**
 * E2E Tests: PATCH /api/users/:id Successful Update Flow
 * Tests successful profile updates with complete HTTP flow
 */

import request from 'supertest';
import app from '../../src/app';
import db from '../../src/shared/database/connection';
import { generateAccessToken } from '../../src/shared/utils/jwt.utils';

describe('PATCH /api/users/:id Successful Update E2E Flow', () => {
  let testUserId: number;
  let authToken: string;

  beforeAll(async () => {
    // Insert test user
    const [user] = await db('users')
      .insert({
        email: 'success-test@example.com',
        password_hash: 'hash123',
        username: 'success_user',
        full_name: 'Success Test User',
        phone_number: '+1234567890',
        skill_level: 'intermediate',
        location_lat: 37.7749,
        location_lng: -122.4194,
        location_name: 'San Francisco',
        preferred_radius_km: 10,
        status: 'active',
      })
      .returning('*');
    testUserId = user.id;
    authToken = generateAccessToken(user);
  });

  afterAll(async () => {
    // Cleanup test users
    await db('users').where({ email: 'success-test@example.com' }).del();
    await db.destroy();
  });

  describe('Successful Update Scenarios', () => {
    it('should update full_name field and return 200 with updated user object', async () => {
      const response = await request(app)
        .patch(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ full_name: 'Updated Full Name' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('full_name', 'Updated Full Name');
      expect(response.body).toHaveProperty('id', testUserId);
      expect(response.body).not.toHaveProperty('password_hash');
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should update preferred_radius_km and location_name and return updated user object', async () => {
      const response = await request(app)
        .patch(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          preferred_radius_km: 25,
          location_name: 'Los Angeles',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('preferred_radius_km', 25);
      expect(response.body).toHaveProperty('location_name', 'Los Angeles');
      expect(response.body).toHaveProperty('id', testUserId);
      expect(response.body).not.toHaveProperty('password_hash');
    });

    it('should handle empty payload with 200 (no-op, user unchanged)', async () => {
      // Get current user state
      const beforeResponse = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const beforeData = beforeResponse.body;

      // Send empty update
      const response = await request(app)
        .patch(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testUserId);
      // Data should remain unchanged
      expect(response.body.full_name).toBe(beforeData.full_name);
      expect(response.body.location_name).toBe(beforeData.location_name);
    });
  });
});
