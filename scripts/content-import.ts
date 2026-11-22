/**
 * Imports the file-based content archive (`content/`) into the database as published entries.
 *
 *   npm run content:import            add items that aren't in the database yet (safe to re-run)
 *   npm run content:import -- --force also overwrite items that already exist (discards CMS edits)
 */
import path from 'node:path';
import nextEnv from '@next/env';
import knex from 'knex';
import { knexConfig, scriptDatabaseUrl } from '../knexfile';
import { docKey, TAXONOMY_KEY, type ContentType } from '../src/lib/validation/content';
import { readArchive } from './content-files';

nextEnv.loadEnvConfig(process.cwd());

const force = process.argv.includes('--force');

async function main() {
  const archive = readArchive(path.join(process.cwd(), 'content'));
  const items: { type: ContentType; doc: Record<string, unknown> }[] = [
    ...archive.questions.map((doc) => ({ type: 'question' as const, doc })),
    ...archive.guides.map((doc) => ({ type: 'guide' as const, doc })),
    ...archive.studyPlans.map((doc) => ({ type: 'study_plan' as const, doc })),
    ...archive.focusAreas.map((doc) => ({ type: 'focus_area' as const, doc })),
    ...archive.companies.map((doc) => ({ type: 'company' as const, doc })),
    { type: 'taxonomy', doc: archive.taxonomy },
  ];

  const db = knex(knexConfig(scriptDatabaseUrl()));
  try {
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    await db.transaction(async (trx) => {
      const order: Partial<Record<ContentType, number>> = {};
      for (const { type, doc } of items) {
        const key = type === 'taxonomy' ? TAXONOMY_KEY : docKey(type, doc);
        const sortOrder = (order[type] = (order[type] ?? 0) + 1);
        const json = JSON.stringify(doc);
        const existing = await trx('content_entries').where({ type, key }).first('id');
        if (existing && !force) {
          skipped++;
          continue;
        }
        const values = {
          draft: json,
          published: json,
          published_at: trx.fn.now(),
          draft_updated_at: trx.fn.now(),
          sort_order: sortOrder,
          archived_at: null,
          updated_at: trx.fn.now(),
        };
        let id: string;
        if (existing) {
          await trx('content_entries').where({ id: existing.id }).update(values);
          id = existing.id;
          updated++;
        } else {
          [{ id }] = await trx('content_entries')
            .insert({ type, key, ...values })
            .returning('id');
          inserted++;
        }
        await trx('content_revisions').insert({ entry_id: id, doc: json, kind: 'import' });
      }
      // Learner pages cache the catalog per content version.
      await trx('settings')
        .insert({ key: 'content_version', value: JSON.stringify(Date.now()) })
        .onConflict('key')
        .merge(['value', 'updated_at']);
    });
    console.log(
      `Content import: ${inserted} added, ${updated} overwritten, ${skipped} already in the database` +
        (skipped && !force ? ' (use --force to overwrite them)' : '')
    );
    console.log(
      `Archive: ${archive.questions.length} questions, ${archive.guides.length} guides ` +
        `(${archive.guides.reduce((n, g) => n + g.chapters.length, 0)} chapters), ` +
        `${archive.studyPlans.length} study plans, ${archive.focusAreas.length} focus areas, ` +
        `${archive.companies.length} company guides`
    );
  } finally {
    await db.destroy();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
