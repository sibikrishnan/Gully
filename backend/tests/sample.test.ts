/**
 * Sample Test - Verify Jest Setup
 * This file verifies that the testing infrastructure is working correctly
 */

import db from '../src/shared/database/connection';
import { setupTestDb, teardownTestDb, seedTestUsers } from './helpers/testDb';

describe('Testing Infrastructure', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  describe('Jest Configuration', () => {
    it('should run TypeScript tests', () => {
      const result: string = 'TypeScript works';
      expect(result).toBe('TypeScript works');
    });

    it('should have access to environment variables', () => {
      expect(process.env.NODE_ENV).toBe('test');
      expect(process.env.JWT_SECRET).toBe('test-jwt-secret');
    });
  });

  describe('Database Connection', () => {
    it('should connect to database', async () => {
      const result = await db.raw('SELECT 1 as result');
      expect(result.rows[0].result).toBe(1);
    });

    it('should seed test users', async () => {
      const users = await seedTestUsers();
      expect(users).toHaveLength(3);
      expect(users[0].email).toBe('test1@example.com');
      expect(users[1].email).toBe('test2@example.com');
      expect(users[2].status).toBe('inactive');
    });

    it('should query seeded users', async () => {
      const users = await db('users').select('*');
      expect(users.length).toBeGreaterThanOrEqual(3);
    });
  });
});
