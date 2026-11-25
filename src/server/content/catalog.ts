import 'server-only';
import { cache } from 'react';
import { createLookups, EMPTY_CONTENT, type ContentLookups } from '@/content/lookups';
import type {
  CompanyGuide,
  ClientContentIndex,
  ContentIndex,
  FocusArea,
  Guide,
  QuestionDetailKey,
  QuestionMeta,
  QuestionSummary,
  StudyPlan,
} from '@/content/types';
import type { CompanyDoc, GuideDoc, QuestionDoc } from '@/lib/validation/content';
import { isTestFile } from '@/utils/files';
import { db } from '../db';

/**
 * The published content learners see, read from `content_entries`.
 *
 * The metadata index (~0.5 MB) is kept in memory and rebuilt only when `content_version` changes
 * (bumped on every publish), so each request costs one tiny query. Bodies (Markdown, code) are
 * fetched per page. Next's data cache isn't used: the catalog exceeds its 2 MB item limit.
 */

const VERSION_KEY = 'content_version';

let memory: { version: string; lookups: ContentLookups } | null = null;

const live = () =>
  db('content_entries').whereNotNull('published').whereNull('archived_at').orderBy('sort_order');

async function readVersion(): Promise<string> {
  const row = await db('settings').where({ key: VERSION_KEY }).first<{ value: unknown } | undefined>('value');
  return JSON.stringify(row?.value ?? 0);
}

/** Marks the catalog stale for every server instance. Call after publish / unpublish / archive. */
export async function bumpContentVersion() {
  await db('settings')
    .insert({ key: VERSION_KEY, value: JSON.stringify(Date.now()), updated_at: db.fn.now() })
    .onConflict('key')
    .merge(['value', 'updated_at']);
}

/** Folder-listing order (case-insensitive; a folder's files before a longer sibling file name). */
const byPath = (a: string, b: string) => {
  const x = a.split('/');
  const y = b.split('/');
  for (let i = 0; i < Math.min(x.length, y.length); i++) {
    if (x[i] === y[i]) continue;
    const ci = x[i].toLowerCase().localeCompare(y[i].toLowerCase());
    return ci || (x[i] < y[i] ? -1 : 1);
  }
  return x.length - y.length;
};

type QuestionRow = {
  key: string;
  meta: Omit<QuestionDoc, 'prompt' | 'solution' | 'files'>;
  file_keys: string[];
  has_prompt: boolean;
};

async function buildIndex(): Promise<ContentIndex> {
  const [questionRows, guideRows, planRows, areaRows, companyRows] = await Promise.all([
    live()
      .where({ type: 'question' })
      .select<QuestionRow[]>(
        'key',
        db.raw(`published - 'prompt' - 'solution' - 'files' as meta`),
        db.raw(`coalesce((select jsonb_agg(k) from jsonb_object_keys(published->'files') k), '[]') as file_keys`),
        db.raw(`coalesce(published->>'prompt', '') <> '' as has_prompt`)
      ),
    live().where({ type: 'guide' }).select<{ published: GuideDoc }[]>('published'),
    live().where({ type: 'study_plan' }).select<{ published: StudyPlan }[]>('published'),
    live().where({ type: 'focus_area' }).select<{ published: FocusArea }[]>('published'),
    live()
      .where({ type: 'company' })
      .select<{ meta: Omit<CompanyDoc, 'body'> }[]>(db.raw(`published - 'body' as meta`)),
  ]);

  const questions: QuestionMeta[] = questionRows.map(({ key, meta, file_keys, has_prompt }) => ({
    ...meta,
    id: key,
    hasStarter: file_keys.some((f) => f.startsWith('starter/')),
    hasTests: file_keys.some(isTestFile),
    files: [...file_keys, ...(has_prompt ? ['prompt.md'] : []), 'solution.md'].sort(byPath),
  }));

  const guides: Guide[] = guideRows.map(({ published: g }) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    icon: g.icon,
    chapters: g.chapters.map((c, i) => ({
      guide: g.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      order: i + 1,
      source: c.source,
    })),
  }));

  const companies: CompanyGuide[] = companyRows.map(({ meta }) => ({
    slug: meta.slug,
    title: meta.title,
    name: meta.name,
    source: meta.source,
  }));

  return {
    generatedAt: new Date().toISOString(),
    questions,
    studyPlans: planRows.map((r) => r.published),
    focusAreas: areaRows.map((r) => r.published),
    guides,
    companies,
  };
}

/**
 * Published content with lookups (`getQuestion`, `questionsByFormat`…). Deduplicated per request.
 * Never throws: without a database the site renders with no content instead of crashing.
 */
export const getContent = cache(async (): Promise<ContentLookups> => {
  try {
    const version = await readVersion();
    if (memory?.version !== version) {
      memory = { version, lookups: createLookups(await buildIndex()) };
    }
    return memory.lookups;
  } catch (err) {
    console.error('[content] could not load the catalog:', err);
    return memory?.lookups ?? createLookups(EMPTY_CONTENT);
  }
});

/**
 * The catalog as sent to the browser (root layout → ContentProvider): question detail fields
 * (references, file lists, source…) are dropped, roughly halving the per-page payload. The question
 * page gets the full question from the server.
 */
const DETAIL_KEYS: readonly QuestionDetailKey[] = [
  'references',
  'files',
  'source',
  'frameworks',
  'languages',
  'sdType',
  'hasStarter',
  'hasTests',
];

export function toClientIndex(content: ContentIndex): ClientContentIndex {
  return {
    ...content,
    questions: content.questions.map((q) => {
      const summary: Partial<QuestionMeta> = { ...q };
      for (const key of DETAIL_KEYS) delete summary[key];
      return summary as QuestionSummary;
    }),
  };
}

/** When content was last published (sitemap lastModified). Falls back to now. */
export const getContentUpdatedAt = cache(async (): Promise<Date> => {
  try {
    const row = await db('settings')
      .where({ key: VERSION_KEY })
      .first<{ updated_at: Date | string } | undefined>('updated_at');
    return row?.updated_at ? new Date(row.updated_at) : new Date();
  } catch {
    return new Date();
  }
});

/**
 * When each live entry was last published, keyed `${type}:${key}` (e.g. `question:javascript/debounce`,
 * `company:google`). Feeds per-URL `lastmod` in the sitemap. Empty without a database.
 */
export const getPublishedDates = cache(async (): Promise<Map<string, Date>> => {
  try {
    const rows = await live().select<{ type: string; key: string; published_at: Date | string }[]>(
      'type',
      'key',
      'published_at'
    );
    return new Map(rows.map((r) => [`${r.type}:${r.key}`, new Date(r.published_at)]));
  } catch {
    return new Map();
  }
});

/** Prompt, solution and code files of a published question, keyed like the old content folder. */
export const getQuestionFiles = cache(async (id: string): Promise<Record<string, string>> => {
  const row = await live()
    .where({ type: 'question', key: id })
    .first<{ files: Record<string, string> | null; prompt: string | null; solution: string | null } | undefined>(
      db.raw(`published->'files' as files`),
      db.raw(`published->>'prompt' as prompt`),
      db.raw(`published->>'solution' as solution`)
    );
  if (!row) return {};
  return {
    ...(row.files ?? {}),
    ...(row.prompt ? { 'prompt.md': row.prompt } : {}),
    'solution.md': row.solution ?? '',
  };
});

/** Markdown body of a published guide chapter, or null. */
export const getGuideChapterBody = cache(async (guideId: string, slug: string) => {
  const row = await live()
    .where({ type: 'guide', key: guideId })
    .first<{ chapters: GuideDoc['chapters'] } | undefined>(db.raw(`published->'chapters' as chapters`));
  return row?.chapters.find((c) => c.slug === slug)?.body ?? null;
});

/** Markdown body of a published company guide, or null. */
export const getCompanyBody = cache(async (slug: string) => {
  const row = await live()
    .where({ type: 'company', key: slug })
    .first<{ body: string | null } | undefined>(db.raw(`published->>'body' as body`));
  return row?.body ?? null;
});

/** Where an old content URL moved to (after a slug change), if anywhere. */
export async function findRedirect(path: string): Promise<string | null> {
  try {
    const row = await db('content_redirects').where({ from_path: path }).first<{ to_path: string } | undefined>('to_path');
    return row?.to_path ?? null;
  } catch {
    return null;
  }
}
