/**
 * E2E Tests: PATCH /api/users/:id Security
 * Tests authorization checks and field stripping security
 */

import request from 'supertest';
import app from '../../src/app';
import db from '../../src/shared/database/connection';
import { generateAccessToken } from '../../src/shared/utils/jwt.utils';

describe('PATCH /api/users/:id Security E2E Tests', () => {
  let testUserId1: number;
  let testUserId2: number;
  let authToken1: string;

  beforeAll(async () => {
    // Insert test users
    const [user1] = await db('users')
      .insert({
        email: 'security-test1@example.com',
        password_hash: 'original_hash_1',
        username: 'security_user1',
        full_name: 'Security Test User 1',
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
        email: 'security-test2@example.com',
        password_hash: 'original_hash_2',
        username: 'security_user2',
        full_name: 'Security Test User 2',
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
    await db('users').whereIn('email', ['security-test1@example.com', 'security-test2@example.com']).del();
    await db.destroy();
  });

  describe('Authorization Checks', () => {
    it('should allow user to update their own profile (JWT user_id matches :id)', async () => {
      const response = await request(app)
        .patch(`/api/users/${testUserId1}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ full_name: 'Self Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('full_name', 'Self Updated Name');
      expect(response.body).toHaveProperty('id', testUserId1);
    });

    it('should prevent user from updating another user\'s profile with 403', async () => {
      // User 1 attempts to update User 2's profile
      const response = await request(app)
        .patch(`/api/users/${testUserId2}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ full_name: 'Malicious Update' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Forbidden');

      // Verify User 2's profile was NOT updated
      const user2Data = await db('users').where({ id: testUserId2 }).first();
      expect(user2Data.full_name).toBe('Security Test User 2'); // Original name
    });
  });

  describe('Field Stripping Security', () => {
    it('should strip non-updatable fields (id, created_at, password_hash, email)', async () => {
      const maliciousPayload = {
        id: 99999, // Attempt to change ID
        password_hash: 'hacked_password', // Attempt to change password
        email: 'hacked@example.com', // Attempt to change email
        created_at: '2020-01-01T00:00:00Z', // Attempt to change timestamp
        full_name: 'Legitimate Update', // Legitimate field
      };

      const response = await request(app)
        .patch(`/api/users/${testUserId1}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .send(maliciousPayload);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('full_name', 'Legitimate Update');

      // Verify stripped fields remain unchanged in database
      const dbUser = await db('users').where({ id: testUserId1 }).first();
      expect(dbUser.id).toBe(testUserId1); // ID unchanged
      expect(dbUser.password_hash).toBe('original_hash_1'); // Password hash unchanged
      expect(dbUser.email).toBe('security-test1@example.com'); // Email unchanged
      expect(dbUser.full_name).toBe('Legitimate Update'); // Only legitimate field updated
    });
  });
});
