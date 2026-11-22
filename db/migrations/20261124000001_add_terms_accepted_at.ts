import type { Knex } from 'knex';

/** When the user accepted the Terms of Use and Privacy Policy (sign-up or invite). Null for older accounts. */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (t) => {
    t.timestamp('terms_accepted_at', { useTz: true }).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (t) => {
    t.dropColumn('terms_accepted_at');
  });
}
