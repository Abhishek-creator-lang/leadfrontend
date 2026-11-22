/**
 * Writes the published (non-archived) content from the database back to the `content/` folder layout,
 * e.g. to snapshot CMS edits into Git or move content between environments.
 *
 *   npm run content:export                 overwrite ./content
 *   npm run content:export -- --out <dir>  write somewhere else
 */
import path from 'node:path';
import nextEnv from '@next/env';
import knex from 'knex';
import { knexConfig, scriptDatabaseUrl } from '../knexfile';
import type {
  CompanyDoc,
  FocusAreaDoc,
  GuideDoc,
  QuestionDoc,
  StudyPlanDoc,
} from '../src/lib/validation/content';
import { writeArchive } from './content-files';

nextEnv.loadEnvConfig(process.cwd());

async function main() {
  const outFlag = process.argv.indexOf('--out');
  const out = path.resolve(outFlag > -1 ? process.argv[outFlag + 1] : 'content');
  const db = knex(knexConfig(scriptDatabaseUrl()));
  try {
    const rows = await db('content_entries')
      .whereNotNull('published')
      .whereNull('archived_at')
      .orderBy('sort_order')
      .select<{ type: string; published: unknown }[]>('type', 'published');
    const of = <T>(type: string) =>
      rows.filter((r) => r.type === type).map((r) => r.published as T);
    const archive = {
      questions: of<QuestionDoc>('question'),
      guides: of<GuideDoc>('guide'),
      studyPlans: of<StudyPlanDoc>('study_plan'),
      focusAreas: of<FocusAreaDoc>('focus_area'),
      companies: of<CompanyDoc>('company'),
    };
    writeArchive(out, archive);
    console.log(
      `Exported to ${out}: ${archive.questions.length} questions, ${archive.guides.length} guides, ` +
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
