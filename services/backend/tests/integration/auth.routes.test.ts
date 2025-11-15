/**
 * Integration Tests - Auth Routes
 * Tests for authentication endpoints: signup, login, refresh, me
 */

import request from 'supertest';
import express, { Express } from 'express';
import passport from 'passport';
import db from '../../src/shared/database/connection';
import { createTestUser, createSignupData, TEST_CONSTANTS } from '../helpers/fixtures';
import { User } from '../../src/shared/types/auth.types';
import { generateRefreshToken } from '../../src/shared/utils/jwt.utils';
import { configurePassport } from '../../src/shared/config/passport.config';
import authRoutes from '../../src/services/user-service/routes/auth.routes';

describe('Auth Routes Integration Tests', () => {
  let app: Express;
  let testUser: User;
  const testPassword = 'TestPassword123!';

  // Setup Express app with auth routes
  beforeAll(async () => {
    // Initialize Passport
    configurePassport();

    app = express();
    app.use(express.json());
    app.use(passport.initialize());
    app.use('/api/auth', authRoutes);

    // Create a test user for login tests
    testUser = await createTestUser(db, {
      email: 'auth.routes@example.com',
      username: 'authrouteuser',
      password: testPassword,
    });
  });

  // Cleanup
  afterAll(async () => {
    await db('users').where({ id: testUser.id }).del();
  });

  describe('POST /api/auth/signup', () => {
    afterEach(async () => {
      // Clean up any users created during signup tests
      await db('users')
        .whereIn('email', [
          'newuser@example.com',
          'duplicate@example.com',
          'weak@example.com',
          'missing@example.com',
        ])
        .del();
    });

    it('should create user with valid data and return tokens (201)', async () => {
      const signupData = createSignupData({
        email: 'newuser@example.com',
        password: TEST_CONSTANTS.VALID_PASSWORD,
      });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(signupData.email);
      expect(response.body.data.user.password_hash).toBeUndefined();

      // Verify user was created in database
      const user = await db('users')
        .where({ email: signupData.email })
        .first();

      expect(user).toBeDefined();
      expect(user.email).toBe(signupData.email);
      expect(user.password_hash).toBeDefined();
      expect(user.password_hash).not.toBe(signupData.password);
    });

    it('should reject duplicate email (409)', async () => {
      const signupData = createSignupData({
        email: testUser.email, // Use existing user's email
        password: TEST_CONSTANTS.VALID_PASSWORD,
      });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.toLowerCase()).toContain('email');
    });

    it('should reject duplicate username (409)', async () => {
      const signupData = createSignupData({
        email: 'uniqueemail@example.com',
        username: testUser.username, // Use existing user's username
        password: TEST_CONSTANTS.VALID_PASSWORD,
      });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.toLowerCase()).toContain('username');
    });

    it('should reject weak password (400)', async () => {
      const signupData = createSignupData({
        email: 'weak@example.com',
        password: TEST_CONSTANTS.WEAK_PASSWORD,
      });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should reject missing required fields (400)', async () => {
      const invalidData = {
        email: 'missing@example.com',
        // Missing password, username, full_name, skill_level
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return accessToken and refreshToken', async () => {
      const signupData = createSignupData();

      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData)
        .expect(201);

      expect(response.body.data.accessToken).toBeDefined();
      expect(typeof response.body.data.accessToken).toBe('string');
      expect(response.body.data.accessToken.split('.')).toHaveLength(3); // JWT format

      expect(response.body.data.refreshToken).toBeDefined();
      expect(typeof response.body.data.refreshToken).toBe('string');
      expect(response.body.data.refreshToken.split('.')).toHaveLength(3);
    });

    it('should hash password in database', async () => {
      const signupData = createSignupData();

      await request(app)
        .post('/api/auth/signup')
        .send(signupData)
        .expect(201);

      const user = await db('users')
        .where({ email: signupData.email })
        .first();

      expect(user.password_hash).toBeDefined();
      expect(user.password_hash).not.toBe(signupData.password);
      expect(user.password_hash.length).toBeGreaterThan(50); // bcrypt hash length
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials (200)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testPassword,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.password_hash).toBeUndefined();
    });

    it('should reject invalid email (401)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should reject wrong password (401)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should reject inactive user (403)', async () => {
      // Create inactive user
      const inactiveUser = await createTestUser(db, {
        email: 'inactive.login@example.com',
        username: 'inactiveloginuser',
        password: testPassword,
        status: 'inactive',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: inactiveUser.email,
          password: testPassword,
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('active');

      // Cleanup
      await db('users').where({ id: inactiveUser.id }).del();
    });

    it('should update last_login_at timestamp', async () => {
      const userBefore = await db('users')
        .where({ id: testUser.id })
        .first();

      await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testPassword,
        })
        .expect(200);

      const userAfter = await db('users')
        .where({ id: testUser.id })
        .first();

      // last_login_at should be updated
      expect(userAfter.last_login_at).toBeDefined();
      if (userBefore.last_login_at) {
        expect(new Date(userAfter.last_login_at).getTime()).toBeGreaterThanOrEqual(
          new Date(userBefore.last_login_at).getTime()
        );
      }
    });

    it('should return accessToken and refreshToken', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testPassword,
        })
        .expect(200);

      expect(response.body.data.accessToken).toBeDefined();
      expect(typeof response.body.data.accessToken).toBe('string');
      expect(response.body.data.accessToken.split('.')).toHaveLength(3);

      expect(response.body.data.refreshToken).toBeDefined();
      expect(typeof response.body.data.refreshToken).toBe('string');
      expect(response.body.data.refreshToken.split('.')).toHaveLength(3);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should generate new access token with valid refresh token (200)', async () => {
      const { password_hash, ...userWithoutPassword } = testUser;
      const validRefreshToken = generateRefreshToken(userWithoutPassword);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: validRefreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(typeof response.body.data.accessToken).toBe('string');
      expect(response.body.data.accessToken.split('.')).toHaveLength(3);
    });

    it('should reject invalid refresh token (401)', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid.refresh.token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should reject expired refresh token (401)', async () => {
      // Create a token with immediate expiration
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: testUser.id, email: testUser.email },
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production',
        { expiresIn: '-1s' } // Expired 1 second ago
      );

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: expiredToken })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should reject refresh token for non-existent user (401)', async () => {
      const jwt = require('jsonwebtoken');
      const fakeToken = jwt.sign(
        { userId: 999999, email: 'nonexistent@example.com', username: 'nonexistent' },
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production',
        { expiresIn: '7d' }
      );

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: fakeToken })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('User not found');
    });

    it('should reject refresh token for inactive user (403)', async () => {
      // Create inactive user
      const inactiveUser = await createTestUser(db, {
        email: 'inactive.refresh@example.com',
        username: 'inactiverefreshuser',
        password: testPassword,
        status: 'inactive',
      });

      const { password_hash, ...userWithoutPassword } = inactiveUser;
      const refreshToken = generateRefreshToken(userWithoutPassword);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('active');

      // Cleanup
      await db('users').where({ id: inactiveUser.id }).del();
    });
  });

  describe('GET /api/auth/me', () => {
    let validAccessToken: string;

    beforeAll(async () => {
      // Login to get a valid access token
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testPassword,
        });

      validAccessToken = response.body.data.accessToken;
    });

    it('should return user data with valid token (200)', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.id).toBe(testUser.id);
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('should reject request without token (401)', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should reject request with invalid token (401)', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should not include password_hash in response', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .expect(200);

      expect(response.body.data.user.password_hash).toBeUndefined();
    });
  });
});
