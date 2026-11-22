import path from 'path';
import type { Knex } from 'knex';

/**
 * Shared Knex configuration, used by the app (`src/server/db.ts`) and the scripts (`scripts/db.ts`,
 * content import/export). Callers are responsible for loading `.env*` first.
 *
 * Serverless (Vercel): every function instance opens its own pool, so keep it small and point
 * DATABASE_URL at the host's *pooled* connection string (Neon: the "-pooler" host).
 */
export function knexConfig(databaseUrl = process.env.DATABASE_URL): Knex.Config {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.');
  }
  const serverless = !!process.env.VERCEL;
  const max = Number(process.env.DB_POOL_MAX) || (serverless ? 3 : 10);
  return {
    client: 'pg',
    connection: databaseUrl,
    pool: {
      min: 0,
      max,
      // Release idle connections quickly on serverless so frozen instances don't hold them.
      idleTimeoutMillis: serverless ? 10_000 : 30_000,
    },
    migrations: {
      directory: path.join(process.cwd(), 'db', 'migrations'),
      tableName: 'knex_migrations',
      extension: 'ts',
      loadExtensions: ['.ts'],
    },
  };
}

/**
 * Connection used by migrations and content import/export: the direct (unpooled) URL when one is
 * configured. Schema changes and long transactions should not go through a transaction pooler.
 */
export const scriptDatabaseUrl = () =>
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

export default knexConfig;
