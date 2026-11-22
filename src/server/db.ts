import 'server-only';
import knex, { Knex } from 'knex';
import { knexConfig } from '../../knexfile';
import { env } from './env';

const globalForDb = globalThis as unknown as { __knex?: Knex };

/** Creates the pool on first use (cached on globalThis so dev hot reloads don't open new pools). */
function instance(): Knex {
  globalForDb.__knex ??= knex(knexConfig(env().DATABASE_URL));
  return globalForDb.__knex;
}

/**
 * Shared Knex instance, connected lazily: importing this module never touches the database or the
 * environment, so guest pages and `next build` work without DATABASE_URL.
 */
export const db = new Proxy(function () {} as unknown as Knex, {
  apply: (_target, _this, args: unknown[]) =>
    (instance() as unknown as (...a: unknown[]) => unknown)(...args),
  get: (_target, prop) => {
    const k = instance() as unknown as Record<PropertyKey, unknown>;
    const value = k[prop];
    return typeof value === 'function' ? value.bind(k) : value;
  },
});
