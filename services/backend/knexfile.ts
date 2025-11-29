import type { Knex } from 'knex';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'gully_dev',
      user: process.env.DB_USER || 'gully_user',
      password: process.env.DB_PASSWORD || 'gully_password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'src/shared/database/migrations'),
      extension: 'ts',
    },
    seeds: {
      directory: path.join(__dirname, 'src/shared/database/seeds'),
      extension: 'ts',
    },
  },

  test: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME_TEST || 'gully_test',
      user: process.env.DB_USER || 'gully_user',
      password: process.env.DB_PASSWORD || 'gully_password',
    },
    pool: {
      min: 1,
      max: 5,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'src/shared/database/migrations'),
      extension: 'ts',
    },
    seeds: {
      directory: path.join(__dirname, 'src/shared/database/seeds'),
      extension: 'ts',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 2,
      max: 20,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'src/shared/database/migrations'),
      extension: 'ts',
    },
    seeds: {
      directory: path.join(__dirname, 'src/shared/database/seeds'),
      extension: 'ts',
    },
  },
};

export default config;
