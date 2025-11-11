// Global test setup and teardown
// This file runs before all tests

import db from '../src/shared/database/connection';

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for all tests (can be overridden per test)
jest.setTimeout(10000);

// Global test lifecycle hooks
beforeAll(async () => {
  // Migrations should be run manually before tests: NODE_ENV=test npm run migrate:latest
  // This avoids locking issues with multiple test files
});

afterAll(async () => {
  // Close database connection after all tests
  await db.destroy();
});

// Reset mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});
