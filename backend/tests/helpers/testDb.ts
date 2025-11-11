import knex, { Knex } from 'knex';
import knexConfig from '../../knexfile';

let db: Knex | null = null;

/**
 * Get or create a database connection for tests
 */
export const getTestDb = (): Knex => {
  if (!db) {
    db = knex(knexConfig.test);
  }
  return db;
};

/**
 * Setup test database - run migrations
 */
export const setupTestDb = async (): Promise<void> => {
  const testDb = getTestDb();
  
  // Rollback all migrations
  await testDb.migrate.rollback(undefined, true);
  
  // Run all migrations
  await testDb.migrate.latest();
};

/**
 * Clean all tables in the test database
 */
export const cleanTestDb = async (): Promise<void> => {
  const testDb = getTestDb();
  
  // Get all table names
  const tables = await testDb.raw(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename != 'knex_migrations' 
    AND tablename != 'knex_migrations_lock'
  `);
  
  // Truncate all tables
  for (const table of tables.rows) {
    await testDb.raw(`TRUNCATE TABLE "${table.tablename}" CASCADE`);
  }
};

/**
 * Seed test database with data
 */
export const seedTestDb = async (): Promise<void> => {
  const testDb = getTestDb();
  await testDb.seed.run();
};

/**
 * Teardown test database - close connections
 */
export const teardownTestDb = async (): Promise<void> => {
  if (db) {
    await db.destroy();
    db = null;
  }
};

/**
 * Run a callback within a transaction that gets rolled back
 * Useful for tests that need database isolation
 */
export const withTransaction = async <T>(
  callback: (trx: Knex.Transaction) => Promise<T>
): Promise<T> => {
  const testDb = getTestDb();
  
  return testDb.transaction(async (trx) => {
    try {
      const result = await callback(trx);
      await trx.rollback();
      return result;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  });
};
