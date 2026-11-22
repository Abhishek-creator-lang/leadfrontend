import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.text('email').notNullable();
    t.text('name').notNullable();
    // Null until the user sets a password (accepting an admin invite).
    t.text('password_hash');
    t.text('role').notNullable().defaultTo('learner');
    t.text('status').notNullable().defaultTo('pending');
    t.timestamp('email_verified_at', { useTz: true });
    t.timestamp('last_login_at', { useTz: true });
    t.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    t.timestamps(true, true);

    t.check("role in ('super_admin', 'admin', 'learner')", [], 'users_role_check');
    t.check("status in ('pending', 'active', 'inactive')", [], 'users_status_check');
  });

  await knex.raw('create unique index users_email_lower_unique on users (lower(email))');
  // Exactly one super admin can exist; the database enforces it.
  await knex.raw(
    "create unique index users_single_super_admin on users (role) where role = 'super_admin'"
  );
  await knex.raw('create index users_role_status_idx on users (role, status)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
