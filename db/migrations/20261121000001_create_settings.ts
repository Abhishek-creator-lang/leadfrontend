import type { Knex } from 'knex';

/** Platform settings editable from the admin area, one JSON document per key (e.g. "support"). */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('settings', (t) => {
    t.text('key').primary();
    t.jsonb('value').notNullable();
    t.uuid('updated_by').references('id').inTable('users').onDelete('SET NULL');
    t.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('settings');
}
