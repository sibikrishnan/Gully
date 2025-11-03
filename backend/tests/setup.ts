/**
 * Jest Test Setup
 * Runs before all tests
 */

import db from '../src/shared/database/connection';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Global test timeout
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
  await db.destroy();
});
