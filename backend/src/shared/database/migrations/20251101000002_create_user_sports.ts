import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create user_sports table
  await knex.schema.createTable('user_sports', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign key to users
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    // Sport details
    table.string('sport_name', 50).notNullable();
    table
      .enum('skill_level', ['beginner', 'intermediate', 'advanced', 'expert'])
      .defaultTo('beginner');
    table.integer('years_experience');
    table.string('preferred_position', 50);

    // Timestamp
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Unique constraint - one sport per user
    table.unique(['user_id', 'sport_name']);

    // Indexes
    table.index('user_id');
    table.index('sport_name');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_sports');
}
