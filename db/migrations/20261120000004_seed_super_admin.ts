import type { Knex } from 'knex';
import { hashPassword } from '../../src/server/crypto';

/**
 * Creates the single super admin from SUPER_ADMIN_EMAIL / SUPER_ADMIN_NAME / SUPER_ADMIN_PASSWORD.
 * Idempotent: does nothing if a super admin already exists. Change the password after first login.
 */
export async function up(knex: Knex): Promise<void> {
  const existing = await knex('users').where({ role: 'super_admin' }).first('id');
  if (existing) return;

  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const name = process.env.SUPER_ADMIN_NAME?.trim() || 'Super Admin';
  const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD (see .env.example) before migrating.'
    );
  }
  if (password.length < 8) throw new Error('SUPER_ADMIN_PASSWORD must be at least 8 characters.');

  await knex('users').insert({
    email,
    name,
    password_hash: await hashPassword(password),
    role: 'super_admin',
    status: 'active',
    email_verified_at: knex.fn.now(),
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex('users').where({ role: 'super_admin' }).delete();
}
