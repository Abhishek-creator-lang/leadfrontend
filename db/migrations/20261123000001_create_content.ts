import type { Knex } from 'knex';

/**
 * Learner content managed from the admin CMS. Every type (question, guide, study plan, focus area,
 * company, taxonomy) is one JSON document per entry, validated in the app with zod.
 * `draft` is the working copy; `published` is what learners see (null = never published).
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('content_entries', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.text('type').notNullable();
    // Public id used in URLs and progress: "javascript/array-prototype-at", "lead-75", "google"…
    t.text('key').notNullable();
    t.jsonb('draft').notNullable();
    t.jsonb('published');
    t.timestamp('published_at', { useTz: true });
    t.timestamp('draft_updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.integer('sort_order').notNullable().defaultTo(0);
    t.timestamp('archived_at', { useTz: true });
    t.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    t.uuid('updated_by').references('id').inTable('users').onDelete('SET NULL');
    t.timestamps(true, true);

    t.unique(['type', 'key']);
    t.index(['type', 'archived_at']);
    t.check(
      "type in ('question', 'guide', 'study_plan', 'focus_area', 'company', 'taxonomy')",
      [],
      'content_entries_type_check'
    );
  });

  await knex.schema.createTable('content_revisions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('entry_id')
      .notNullable()
      .references('id')
      .inTable('content_entries')
      .onDelete('CASCADE');
    t.jsonb('doc').notNullable();
    t.text('kind').notNullable();
    t.text('note');
    t.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.index(['entry_id', 'created_at']);
    t.check("kind in ('save', 'publish', 'restore', 'import')", [], 'content_revisions_kind_check');
  });

  // Old URLs keep working after a slug/key change.
  await knex.schema.createTable('content_redirects', (t) => {
    t.text('from_path').primary();
    t.text('to_path').notNullable();
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('content_redirects');
  await knex.schema.dropTableIfExists('content_revisions');
  await knex.schema.dropTableIfExists('content_entries');
  await knex('settings').where({ key: 'content_version' }).delete();
}
