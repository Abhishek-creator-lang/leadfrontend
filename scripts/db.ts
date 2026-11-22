/**
 * Migration runner (TypeScript migrations run under tsx, no ts-node needed).
 *
 *   npm run db:migrate            apply all pending migrations (creates the super admin)
 *   npm run db:rollback           undo the last batch
 *   npm run db:status             list completed / pending migrations
 *   npm run db:make -- <name>     create a new migration file in db/migrations
 */
import nextEnv from '@next/env';
import knex from 'knex';
import { knexConfig, scriptDatabaseUrl } from '../knexfile';

nextEnv.loadEnvConfig(process.cwd());

async function main() {
  const [command, name] = process.argv.slice(2);
  const db = knex(knexConfig(scriptDatabaseUrl()));
  try {
    switch (command) {
      case 'latest': {
        const [batch, files] = await db.migrate.latest();
        console.log(
          files.length ? `Batch ${batch}: applied\n  ${files.join('\n  ')}` : 'Already up to date.'
        );
        break;
      }
      case 'rollback': {
        const [batch, files] = await db.migrate.rollback();
        console.log(
          files.length
            ? `Batch ${batch}: rolled back\n  ${files.join('\n  ')}`
            : 'Nothing to roll back.'
        );
        break;
      }
      case 'status': {
        const [done, pending] = (await db.migrate.list()) as [
          { name: string }[],
          { file: string }[],
        ];
        console.log(
          `Completed (${done.length}):\n  ${done.map((m) => m.name).join('\n  ') || '-'}`
        );
        console.log(
          `Pending (${pending.length}):\n  ${pending.map((m) => m.file).join('\n  ') || '-'}`
        );
        break;
      }
      case 'make': {
        if (!name) throw new Error('Usage: npm run db:make -- <name>');
        console.log(`Created ${await db.migrate.make(name)}`);
        break;
      }
      default:
        throw new Error(
          `Unknown command "${command}". Use latest | rollback | status | make <name>.`
        );
    }
  } finally {
    await db.destroy();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
