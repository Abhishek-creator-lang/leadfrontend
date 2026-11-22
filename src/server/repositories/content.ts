import 'server-only';
import type { Knex } from 'knex';
import {
  DOC_SCHEMAS,
  docKey,
  docTitle,
  type ContentType,
  type FocusAreaDoc,
  type StudyPlanDoc,
} from '@/lib/validation/content';
import { db } from '../db';
import { bumpContentVersion } from '../content/catalog';

/** Admin-facing status of an entry. */
export type EntryStatus = 'draft' | 'published' | 'changed' | 'archived';

export interface EntryRow {
  id: string;
  type: ContentType;
  key: string;
  draft: Record<string, unknown>;
  published: Record<string, unknown> | null;
  published_at: Date | null;
  draft_updated_at: Date;
  sort_order: number;
  archived_at: Date | null;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface EntrySummary {
  id: string;
  key: string;
  title: string;
  status: EntryStatus;
  format?: string;
  updatedAt: Date;
  updatedBy: string | null;
}

const MAX_SAVE_REVISIONS = 50;

/** SQL for the admin status of a row (see EntryStatus). */
const STATUS_SQL = `case
  when e.archived_at is not null then 'archived'
  when e.published is null then 'draft'
  when e.draft <> e.published then 'changed'
  else 'published' end`;

/** Content type → URL prefix of its learner page (used for redirects after a key change). */
const LEARNER_PATH: Partial<Record<ContentType, string>> = {
  question: '/questions',
  guide: '/guides',
  study_plan: '/study-plans',
  focus_area: '/focus-areas',
  company: '/companies',
};

export class ContentError extends Error {}

export interface ListQuery {
  type: ContentType;
  search?: string;
  status?: EntryStatus;
  format?: string;
  page?: number;
  pageSize?: number;
}

export async function listEntries({
  type,
  search,
  status,
  format,
  page = 1,
  pageSize = 25,
}: ListQuery) {
  const base = db('content_entries as e')
    .leftJoin('users as u', 'u.id', 'e.updated_by')
    .where('e.type', type)
    .modify((q) => {
      if (search) {
        const like = `%${search.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
        q.where((w) =>
          w
            .whereRaw(`e.draft->>'title' ilike ?`, [like])
            .orWhereRaw(`e.draft->>'name' ilike ?`, [like])
            .orWhereILike('e.key', like)
        );
      }
      if (status) q.whereRaw(`(${STATUS_SQL}) = ?`, [status]);
      if (format) q.whereRaw(`e.draft->>'format' = ?`, [format]);
    });

  const [{ count }] = await base.clone().count<{ count: string }[]>({ count: '*' });
  const rows = await base
    .clone()
    .select<
      {
        id: string;
        key: string;
        draft: Record<string, unknown>;
        status: EntryStatus;
        draft_updated_at: Date;
        updated_by_name: string | null;
      }[]
    >(
      'e.id',
      'e.key',
      db.raw(
        `jsonb_build_object('title', e.draft->'title', 'name', e.draft->'name', 'format', e.draft->'format') as draft`
      ),
      db.raw(`${STATUS_SQL} as status`),
      'e.draft_updated_at',
      'u.name as updated_by_name'
    )
    .orderBy('e.sort_order')
    .orderBy('e.key')
    .limit(pageSize)
    .offset((Math.max(page, 1) - 1) * pageSize);

  const items: EntrySummary[] = rows.map((r) => ({
    id: r.id,
    key: r.key,
    title: docTitle(type, r.draft) || r.key,
    status: r.status,
    format: typeof r.draft.format === 'string' ? r.draft.format : undefined,
    updatedAt: r.draft_updated_at,
    updatedBy: r.updated_by_name,
  }));
  return { items, total: Number(count), page, pageSize };
}

/** Entry counts per type and status, for the content home page. */
export async function contentCounts() {
  const rows = await db('content_entries as e')
    .select('e.type', db.raw(`${STATUS_SQL} as status`))
    .count<{ type: ContentType; status: EntryStatus; count: string }[]>({ count: '*' })
    .groupBy('e.type', 'status');
  const out = {} as Record<ContentType, Record<EntryStatus, number>>;
  for (const r of rows) {
    out[r.type] ??= { draft: 0, published: 0, changed: 0, archived: 0 };
    out[r.type][r.status] = Number(r.count);
  }
  return out;
}

/** Recently edited entries across all types. */
export async function recentlyEdited(limit = 8) {
  const rows = await db('content_entries as e')
    .leftJoin('users as u', 'u.id', 'e.updated_by')
    .select<
      {
        id: string;
        type: ContentType;
        key: string;
        draft: Record<string, unknown>;
        draft_updated_at: Date;
        name: string | null;
      }[]
    >(
      'e.id',
      'e.type',
      'e.key',
      db.raw(`jsonb_build_object('title', e.draft->'title', 'name', e.draft->'name') as draft`),
      'e.draft_updated_at',
      'u.name'
    )
    .whereNotNull('e.updated_by')
    .orderBy('e.draft_updated_at', 'desc')
    .limit(limit);
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    title: docTitle(r.type, r.draft) || r.key,
    updatedAt: r.draft_updated_at,
    updatedBy: r.name,
  }));
}

export const getEntry = (id: string) => db<EntryRow>('content_entries').where({ id }).first();

export const getEntryByKey = (type: ContentType, key: string) =>
  db<EntryRow>('content_entries').where({ type, key }).first();

/** Lightweight list of all questions, for pickers in plan / focus-area editors. */
export async function questionOptions() {
  return db('content_entries as e')
    .where('e.type', 'question')
    .select<{ key: string; title: string; format: string; status: EntryStatus }[]>(
      'e.key',
      db.raw(`e.draft->>'title' as title`),
      db.raw(`e.draft->>'format' as format`),
      db.raw(`${STATUS_SQL} as status`)
    )
    .orderBy('e.sort_order');
}

async function addRevision(
  trx: Knex,
  entryId: string,
  doc: unknown,
  kind: 'save' | 'publish' | 'restore',
  userId: string
) {
  await trx('content_revisions').insert({
    entry_id: entryId,
    doc: JSON.stringify(doc),
    kind,
    created_by: userId,
  });
  if (kind === 'save') {
    // Keep the most recent saves; publish/import/restore revisions are kept forever.
    await trx.raw(
      `delete from content_revisions where id in (
         select id from content_revisions where entry_id = ? and kind = 'save'
         order by created_at desc offset ?)`,
      [entryId, MAX_SAVE_REVISIONS]
    );
  }
}

/** Validates a document for a draft save (shape only) and returns the parsed doc. */
export function parseDoc(type: ContentType, doc: unknown) {
  const parsed = DOC_SCHEMAS[type].safeParse(doc);
  if (!parsed.success) return { ok: false as const, error: parsed.error };
  return { ok: true as const, doc: parsed.data as Record<string, unknown> };
}

async function assertKeyFree(trx: Knex, type: ContentType, key: string, exceptId?: string) {
  const clash = await trx('content_entries')
    .where({ type, key })
    .modify((q) => {
      if (exceptId) q.whereNot({ id: exceptId });
    })
    .first('id');
  if (clash) throw new ContentError(`Another ${type.replace('_', ' ')} already uses "${key}".`);
}

export async function createEntry(type: ContentType, doc: Record<string, unknown>, userId: string) {
  return db.transaction(async (trx) => {
    const key = docKey(type, doc);
    await assertKeyFree(trx, type, key);
    const [{ max }] = await trx('content_entries')
      .where({ type })
      .max<{ max: number | null }[]>({ max: 'sort_order' });
    const [row] = await trx('content_entries')
      .insert({
        type,
        key,
        draft: JSON.stringify(doc),
        sort_order: (max ?? 0) + 1,
        created_by: userId,
        updated_by: userId,
      })
      .returning<{ id: string }[]>('id');
    await addRevision(trx, row.id, doc, 'save', userId);
    return row.id;
  });
}

/**
 * Saves the working copy. Never-published entries follow their key (slug) right away; published
 * entries keep their public key until the next publish (see publishEntry).
 */
export async function saveDraft(id: string, doc: Record<string, unknown>, userId: string) {
  await db.transaction(async (trx) => {
    const entry = await trx<EntryRow>('content_entries').where({ id }).forUpdate().first();
    if (!entry) throw new ContentError('This item no longer exists.');
    const key = docKey(entry.type, doc);
    if (key !== entry.key) await assertKeyFree(trx, entry.type, key, id);
    await trx('content_entries')
      .where({ id })
      .update({
        draft: JSON.stringify(doc),
        ...(entry.published === null ? { key } : {}),
        draft_updated_at: trx.fn.now(),
        updated_by: userId,
        updated_at: trx.fn.now(),
      });
    await addRevision(trx, id, doc, 'save', userId);
  });
}

/** Questions referenced by a plan / focus area document. */
function referencedQuestions(type: ContentType, doc: Record<string, unknown>): string[] {
  if (type === 'study_plan') return (doc as StudyPlanDoc).sections.flatMap((s) => s.questions);
  if (type === 'focus_area') return (doc as FocusAreaDoc).questions;
  return [];
}

/**
 * Problems that block publishing: references to questions that aren't live. Returns messages
 * (empty = OK).
 */
export async function publishProblems(type: ContentType, doc: Record<string, unknown>) {
  const refs = [...new Set(referencedQuestions(type, doc))];
  if (!refs.length) return [];
  const live = await db('content_entries')
    .where({ type: 'question' })
    .whereIn('key', refs)
    .whereNotNull('published')
    .whereNull('archived_at')
    .pluck('key');
  const ok = new Set(live);
  return refs.filter((r) => !ok.has(r)).map((r) => `"${r}" is not a published question`);
}

/** Rewrites question references in every plan and focus area (draft and live copies). */
async function renameQuestionRefs(trx: Knex, from: string, to: string) {
  const rows = await trx<EntryRow>('content_entries').whereIn('type', ['study_plan', 'focus_area']);
  const swap = (ids: string[]) => ids.map((q) => (q === from ? to : q));
  for (const row of rows) {
    const fix = (doc: Record<string, unknown> | null) => {
      if (!doc) return doc;
      if (row.type === 'focus_area')
        return { ...doc, questions: swap((doc as FocusAreaDoc).questions) };
      const plan = doc as StudyPlanDoc;
      return {
        ...plan,
        sections: plan.sections.map((s) => ({ ...s, questions: swap(s.questions) })),
      };
    };
    const draft = fix(row.draft);
    const published = fix(row.published);
    if (
      JSON.stringify(draft) !== JSON.stringify(row.draft) ||
      JSON.stringify(published) !== JSON.stringify(row.published)
    ) {
      await trx('content_entries')
        .where({ id: row.id })
        .update({
          draft: JSON.stringify(draft),
          published: published ? JSON.stringify(published) : null,
        });
    }
  }
}

/** Moves URLs, references and learner progress from an old key to a new one. */
async function renameKey(trx: Knex, type: ContentType, from: string, to: string) {
  const prefix = LEARNER_PATH[type];
  if (prefix) {
    const oldPath = `${prefix}/${from}`;
    const newPath = `${prefix}/${to}`;
    // Chains: anything that redirected to the old path now goes straight to the new one.
    await trx('content_redirects').where({ to_path: oldPath }).update({ to_path: newPath });
    await trx('content_redirects').where({ from_path: newPath }).delete();
    await trx('content_redirects')
      .insert({ from_path: oldPath, to_path: newPath })
      .onConflict('from_path')
      .merge(['to_path']);
  }
  if (type === 'question') {
    await renameQuestionRefs(trx, from, to);
    await trx('question_progress').where({ question_id: from }).update({ question_id: to });
  }
  if (type === 'study_plan') {
    await trx('started_plans').where({ plan_id: from }).update({ plan_id: to });
  }
}

export async function publishEntry(id: string, userId: string) {
  await db.transaction(async (trx) => {
    const entry = await trx<EntryRow>('content_entries').where({ id }).forUpdate().first();
    if (!entry) throw new ContentError('This item no longer exists.');
    if (entry.archived_at) throw new ContentError('Restore this item before publishing it.');
    const parsed = parseDoc(entry.type, entry.draft);
    if (!parsed.ok)
      throw new ContentError('The draft has invalid fields. Fix them and save first.');
    const problems = await publishProblems(entry.type, parsed.doc);
    if (problems.length) throw new ContentError(`Can't publish yet: ${problems.join('; ')}.`);

    const key = docKey(entry.type, parsed.doc);
    if (key !== entry.key) {
      await assertKeyFree(trx, entry.type, key, id);
      if (entry.published) await renameKey(trx, entry.type, entry.key, key);
    }
    await trx('content_entries')
      .where({ id })
      .update({
        key,
        published: JSON.stringify(parsed.doc),
        published_at: trx.fn.now(),
        updated_by: userId,
        updated_at: trx.fn.now(),
      });
    await addRevision(trx, id, parsed.doc, 'publish', userId);
  });
  await bumpContentVersion();
}

/** Plans / focus areas whose live copy uses this question. */
export async function referencingEntries(questionKey: string) {
  const rows = await db<EntryRow>('content_entries')
    .whereIn('type', ['study_plan', 'focus_area'])
    .whereNotNull('published')
    .whereNull('archived_at');
  return rows
    .filter((r) => referencedQuestions(r.type, r.published ?? {}).includes(questionKey))
    .map((r) => docTitle(r.type, r.published ?? {}) || r.key);
}

export async function unpublishEntry(id: string, userId: string) {
  const entry = await getEntry(id);
  if (!entry) throw new ContentError('This item no longer exists.');
  if (entry.type === 'question') {
    const users = await referencingEntries(entry.key);
    if (users.length) throw new ContentError(`Used by ${users.join(', ')}. Remove it there first.`);
  }
  await db('content_entries')
    .where({ id })
    .update({ published: null, published_at: null, updated_by: userId, updated_at: db.fn.now() });
  await bumpContentVersion();
}

export async function archiveEntry(id: string, userId: string) {
  const entry = await getEntry(id);
  if (!entry) throw new ContentError('This item no longer exists.');
  if (entry.type === 'taxonomy') throw new ContentError('The tag lists cannot be archived.');
  if (entry.type === 'question') {
    const users = await referencingEntries(entry.key);
    if (users.length) throw new ContentError(`Used by ${users.join(', ')}. Remove it there first.`);
  }
  await db('content_entries')
    .where({ id })
    .update({ archived_at: db.fn.now(), updated_by: userId, updated_at: db.fn.now() });
  await bumpContentVersion();
}

export async function restoreEntry(id: string, userId: string) {
  await db('content_entries')
    .where({ id })
    .update({ archived_at: null, updated_by: userId, updated_at: db.fn.now() });
  await bumpContentVersion();
}

/** Deletes an entry that was never published (published content is archived instead). */
export async function deleteEntry(id: string) {
  const entry = await getEntry(id);
  if (!entry) return;
  if (entry.published || entry.published_at) {
    throw new ContentError('Published content can only be archived, so learner progress is kept.');
  }
  await db('content_entries').where({ id }).delete();
}

export async function listRevisions(entryId: string) {
  return db('content_revisions as r')
    .leftJoin('users as u', 'u.id', 'r.created_by')
    .where('r.entry_id', entryId)
    .select<{ id: string; kind: string; created_at: Date; name: string | null }[]>(
      'r.id',
      'r.kind',
      'r.created_at',
      'u.name'
    )
    .orderBy('r.created_at', 'desc')
    .limit(100);
}

export const getRevision = (entryId: string, revisionId: string) =>
  db('content_revisions')
    .where({ id: revisionId, entry_id: entryId })
    .first<{ doc: Record<string, unknown> } | undefined>('doc');

/** Copies a revision into the draft (never publishes). */
export async function restoreRevision(entryId: string, revisionId: string, userId: string) {
  const rev = await getRevision(entryId, revisionId);
  if (!rev) throw new ContentError('Revision not found.');
  await db.transaction(async (trx) => {
    await trx('content_entries')
      .where({ id: entryId })
      .update({
        draft: JSON.stringify(rev.doc),
        draft_updated_at: trx.fn.now(),
        updated_by: userId,
        updated_at: trx.fn.now(),
      });
    await addRevision(trx, entryId, rev.doc, 'restore', userId);
  });
  return rev.doc;
}

/** Renames or merges a tag across every question draft (taxonomy editor). */
export async function renameTag(
  kind: 'topics' | 'companies',
  from: string,
  to: string,
  userId: string
) {
  await db.transaction(async (trx) => {
    const rows = await trx<EntryRow>('content_entries')
      .where({ type: 'question' })
      .whereRaw(`draft->? \\? ?`, [kind, from]);
    for (const row of rows) {
      const tags = (row.draft[kind] as string[]).map((t) => (t === from ? to : t));
      const doc = { ...row.draft, [kind]: [...new Set(tags)] };
      await trx('content_entries')
        .where({ id: row.id })
        .update({ draft: JSON.stringify(doc), draft_updated_at: trx.fn.now(), updated_by: userId });
      await addRevision(trx, row.id, doc, 'save', userId);
    }
  });
}
