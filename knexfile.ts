import path from 'path';
import type { Knex } from 'knex';

/**
 * Shared Knex configuration, used by the app (`src/server/db.ts`) and the migration runner
 * (`scripts/db.ts`). Reads `DATABASE_URL`; callers are responsible for loading `.env*` first.
 */
export function knexConfig(databaseUrl = process.env.DATABASE_URL): Knex.Config {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.');
  }
  return {
    client: 'pg',
    connection: databaseUrl,
    pool: { min: 0, max: 10 },
    migrations: {
      directory: path.join(process.cwd(), 'db', 'migrations'),
      tableName: 'knex_migrations',
      extension: 'ts',
      loadExtensions: ['.ts'],
    },
  };
}

export default knexConfig;
