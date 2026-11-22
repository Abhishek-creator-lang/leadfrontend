import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // One row per (user, question) the user has interacted with.
  // Daily activity and "recently opened" are derived from completed_at / last_visited_at.
  await knex.schema.createTable('question_progress', (t) => {
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('question_id').notNullable();
    t.timestamp('completed_at', { useTz: true });
    t.boolean('bookmarked').notNullable().defaultTo(false);
    t.text('note');
    t.jsonb('draft');
    t.timestamp('last_visited_at', { useTz: true });
    t.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.primary(['user_id', 'question_id']);
    t.index(['question_id']);
  });
  await knex.raw(
    'create index question_progress_completed_idx on question_progress (user_id, completed_at) where completed_at is not null'
  );

  await knex.schema.createTable('started_plans', (t) => {
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('plan_id').notNullable();
    t.timestamp('started_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.primary(['user_id', 'plan_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('started_plans');
  await knex.schema.dropTableIfExists('question_progress');
}
