/**
 * Integration Tests - Passport Configuration
 * Tests for local authentication strategy
 */

import passport from 'passport';
import { configurePassport } from '../../src/shared/config/passport.config';
import db from '../../src/shared/database/connection';
import { createTestUser } from '../helpers/fixtures';
import { User } from '../../src/shared/types/auth.types';

describe('Passport Configuration Integration Tests', () => {
  let testUser: User;
  const testPassword = 'TestPassword123!';

  // Setup: Create test user before all tests
  beforeAll(async () => {
    // Configure passport
    configurePassport();

    // Create test user
    testUser = await createTestUser(db, {
      email: 'passport.test@example.com',
      username: 'passportuser',
      password: testPassword,
    });
  });

  // Cleanup: Delete test data after all tests
  afterAll(async () => {
    await db('users').where({ id: testUser.id }).del();
  });

  describe('Local Strategy', () => {
    it('should authenticate user with valid credentials', (done) => {
      const req = {
        body: {
          email: testUser.email,
          password: testPassword,
        },
      };

      passport.authenticate('local', (err: any, user: any, _info: any) => {
        expect(err).toBeNull();
        expect(user).toBeDefined();
        expect(user.id).toBe(testUser.id);
        expect(user.email).toBe(testUser.email);
        expect(user.username).toBe(testUser.username);
        expect(user.password_hash).toBeUndefined(); // Password should be removed
        done();
      })(req);
    });

    it('should reject authentication with incorrect password', (done) => {
      const req = {
        body: {
          email: testUser.email,
          password: 'WrongPassword123!',
        },
      };

      passport.authenticate('local', (err: any, user: any, info: any) => {
        expect(err).toBeNull();
        expect(user).toBe(false);
        expect(info).toBeDefined();
        expect(info.message).toBe('Invalid email or password');
        done();
      })(req);
    });

    it('should reject authentication with non-existent email', (done) => {
      const req = {
        body: {
          email: 'nonexistent@example.com',
          password: testPassword,
        },
      };

      passport.authenticate('local', (err: any, user: any, info: any) => {
        expect(err).toBeNull();
        expect(user).toBe(false);
        expect(info).toBeDefined();
        expect(info.message).toBe('Invalid email or password');
        done();
      })(req);
    });

    it('should reject authentication for inactive user', async () => {
      // Create inactive user
      const inactiveUser = await createTestUser(db, {
        email: 'inactive.passport@example.com',
        username: 'inactivepassportuser',
        password: testPassword,
        status: 'inactive',
      });

      const req = {
        body: {
          email: inactiveUser.email,
          password: testPassword,
        },
      };

      await new Promise<void>((resolve) => {
        passport.authenticate('local', (err: any, user: any, info: any) => {
          expect(err).toBeNull();
          expect(user).toBe(false);
          expect(info).toBeDefined();
          expect(info.message).toBe('Account is not active');
          resolve();
        })(req);
      });

      // Cleanup
      await db('users').where({ id: inactiveUser.id }).del();
    });

    it('should reject authentication for suspended user', async () => {
      // Create suspended user
      const suspendedUser = await createTestUser(db, {
        email: 'suspended.passport@example.com',
        username: 'suspendedpassportuser',
        password: testPassword,
        status: 'suspended',
      });

      const req = {
        body: {
          email: suspendedUser.email,
          password: testPassword,
        },
      };

      await new Promise<void>((resolve) => {
        passport.authenticate('local', (err: any, user: any, info: any) => {
          expect(err).toBeNull();
          expect(user).toBe(false);
          expect(info).toBeDefined();
          expect(info.message).toBe('Account is not active');
          resolve();
        })(req);
      });

      // Cleanup
      await db('users').where({ id: suspendedUser.id }).del();
    });

    it('should be case-sensitive for email', (done) => {
      const req = {
        body: {
          email: testUser.email.toUpperCase(), // Different case
          password: testPassword,
        },
      };

      passport.authenticate('local', (err: any, user: any, info: any) => {
        expect(err).toBeNull();
        expect(user).toBe(false);
        expect(info.message).toBe('Invalid email or password');
        done();
      })(req);
    });

    it('should be case-sensitive for password', (done) => {
      const req = {
        body: {
          email: testUser.email,
          password: testPassword.toLowerCase(), // Different case
        },
      };

      passport.authenticate('local', (err: any, user: any, info: any) => {
        expect(err).toBeNull();
        expect(user).toBe(false);
        expect(info.message).toBe('Invalid email or password');
        done();
      })(req);
    });

    it('should update last_login_at timestamp on successful authentication', async () => {
      const req = {
        body: {
          email: testUser.email,
          password: testPassword,
        },
      };

      await new Promise<void>((resolve) => {
        passport.authenticate('local', (err: any, user: any, _info: any) => {
          expect(err).toBeNull();
          expect(user).toBeDefined();
          resolve();
        })(req);
      });

      // Get updated user from database
      const userAfter = await db('users')
        .where({ id: testUser.id })
        .first();

      // Verify last_login_at was updated (should be defined after login)
      expect(userAfter?.last_login_at).toBeDefined();
    });

    it('should handle empty email', (done) => {
      const req = {
        body: {
          email: '',
          password: testPassword,
        },
      };

      passport.authenticate('local', (err: any, user: any, info: any) => {
        expect(err).toBeNull();
        expect(user).toBe(false);
        expect(info.message).toBe('Missing credentials');
        done();
      })(req);
    });

    it('should handle empty password', (done) => {
      const req = {
        body: {
          email: testUser.email,
          password: '',
        },
      };

      passport.authenticate('local', (err: any, user: any, info: any) => {
        expect(err).toBeNull();
        expect(user).toBe(false);
        expect(info.message).toBe('Missing credentials');
        done();
      })(req);
    });

    it('should handle special characters in password', async () => {
      const specialPassword = '!@#$Test123%^&*()';

      // Create user with special password
      const specialUser = await createTestUser(db, {
        email: 'special.passport@example.com',
        username: 'specialpassportuser',
        password: specialPassword,
      });

      const req = {
        body: {
          email: specialUser.email,
          password: specialPassword,
        },
      };

      await new Promise<void>((resolve) => {
        passport.authenticate('local', (err: any, user: any, _info: any) => {
          expect(err).toBeNull();
          expect(user).toBeDefined();
          expect(user.id).toBe(specialUser.id);
          resolve();
        })(req);
      });

      // Cleanup
      await db('users').where({ id: specialUser.id }).del();
    });
  });

  describe('Serialize/Deserialize User', () => {
    it('should serialize user to session', (done) => {
      const user = { id: testUser.id };

      passport.serializeUser(user as any, (err: any, serialized: any) => {
        expect(err).toBeNull();
        expect(serialized).toBe(testUser.id);
        done();
      });
    });

    it('should deserialize user from session', async () => {
      await new Promise<void>((resolve, reject) => {
        passport.deserializeUser(testUser.id, (err: any, user: any) => {
          try {
            expect(err).toBeNull();
            expect(user).toBeDefined();
            if (user) {
              expect(user.id).toBe(testUser.id);
              expect(user.email).toBe(testUser.email);
              expect(user.password_hash).toBeUndefined(); // Password should be removed
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    });

    it('should handle deserialization of non-existent user', async () => {
      const nonExistentId = 999999;

      await new Promise<void>((resolve, reject) => {
        passport.deserializeUser(nonExistentId, (err: any, user: any) => {
          try {
            expect(err).toBeNull();
            expect(user).toBe(false);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    });
  });
});
