// Global test setup and teardown
// This file runs before all tests

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for all tests (can be overridden per test)
jest.setTimeout(10000);

// Global test lifecycle hooks
beforeAll(async () => {
  // Any global setup before all tests run
});

afterAll(async () => {
  // Any global cleanup after all tests complete
});

// Reset mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});
