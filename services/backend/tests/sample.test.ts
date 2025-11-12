/**
 * Sample test to verify testing infrastructure setup
 * This test can be deleted once real tests are written
 */

import { getTestDb, setupTestDb, cleanTestDb, teardownTestDb } from './helpers/testDb';
import { createTestUser, testUserData, generateTestTokens } from './helpers/fixtures';

describe('Testing Infrastructure', () => {
  beforeAll(async () => {
    // Setup test database before all tests
    await setupTestDb();
  });

  afterAll(async () => {
    // Cleanup and close database connections
    await teardownTestDb();
  });

  afterEach(async () => {
    // Clean database after each test
    await cleanTestDb();
  });

  describe('Basic Test Setup', () => {
    it('should run a basic test', () => {
      expect(true).toBe(true);
    });

    it('should do basic arithmetic', () => {
      expect(1 + 1).toBe(2);
    });
  });

  describe('Database Utilities', () => {
    it('should connect to test database', async () => {
      const db = getTestDb();
      expect(db).toBeDefined();
      
      // Test a simple query
      const result = await db.raw('SELECT 1 as value');
      expect(result.rows[0].value).toBe(1);
    });

    it('should have migrations applied', async () => {
      const db = getTestDb();
      
      // Check if users table exists
      const tableExists = await db.schema.hasTable('users');
      expect(tableExists).toBe(true);
    });
  });

  describe('Test Fixtures', () => {
    it('should create a test user', async () => {
      const db = getTestDb();
      const user = await createTestUser(db);
      
      expect(user.id).toBeDefined();
      expect(user.email).toBe(testUserData.email);
      expect(user.username).toBe(testUserData.username);
      expect(user.password_hash).toBeDefined();
      expect(user.created_at).toBeDefined();
    });

    it('should create test user with overrides', async () => {
      const db = getTestDb();
      const customEmail = 'custom@example.com';
      
      const user = await createTestUser(db, { email: customEmail });
      
      expect(user.email).toBe(customEmail);
    });

    it('should generate test tokens', async () => {
      const db = getTestDb();
      const user = await createTestUser(db);
      
      const tokens = generateTestTokens(user);
      
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });
  });

  describe('Database Cleanup', () => {
    it('should clean database between tests', async () => {
      const db = getTestDb();
      
      // Create a user
      await createTestUser(db);
      
      // Verify user exists
      let users = await db('users').select('*');
      expect(users.length).toBe(1);
      
      // Clean database
      await cleanTestDb();
      
      // Verify user is gone
      users = await db('users').select('*');
      expect(users.length).toBe(0);
    });
  });
});
