import knex, { Knex } from 'knex';
import knexConfig from '../../../knexfile';

// Determine environment
const environment = process.env.NODE_ENV || 'development';

// Get configuration for current environment
const config = knexConfig[environment];

// Create and export database connection
const db: Knex = knex(config);

export default db;

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await db.raw('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await db.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}
