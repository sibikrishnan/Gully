import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create users table
  await knex.schema.createTable('users', (table) => {
    // Primary key
    table.increments('id').primary();

    // Authentication fields
    table.string('username', 50).notNullable().unique();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();

    // Profile fields
    table.string('phone_number', 20);
    table.string('full_name', 100);
    table.string('profile_image_url', 500);

    // Skill level
    table.enu('skill_level', ['beginner', 'intermediate', 'advanced', 'expert']).notNullable();

    // Location fields
    table.decimal('location_lat', 10, 7);
    table.decimal('location_lng', 10, 7);
    table.string('location_name', 255);
    table.integer('preferred_radius_km').defaultTo(10);

    // Status fields
    table.enu('status', ['active', 'inactive', 'suspended']).defaultTo('active');

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('last_login_at');

    // Indexes
    table.index('username');
    table.index('email');
    table.index('created_at');
    table.index(['location_lat', 'location_lng']); // For geo queries
  });

  // Create updated_at trigger function
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Create trigger for users table
  await knex.raw(`
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop trigger and function
  await knex.raw('DROP TRIGGER IF EXISTS update_users_updated_at ON users');
  await knex.raw('DROP FUNCTION IF EXISTS update_updated_at_column');

  // Drop table
  await knex.schema.dropTableIfExists('users');
}
