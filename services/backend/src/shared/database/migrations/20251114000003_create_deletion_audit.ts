import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create deletion_audit table
  await knex.schema.createTable('deletion_audit', (table) => {
    // Primary key
    table.increments('id').primary();

    // User reference
    table.integer('user_id').notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

    // Audit fields
    table.timestamp('deleted_at').notNullable().defaultTo(knex.fn.now());
    table.integer('deleted_by').nullable(); // User ID of person who deleted (null for system/self-delete)

    // Indexes
    table.index('user_id');
    table.index('deleted_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('deletion_audit');
}
