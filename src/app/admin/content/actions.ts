'use server';

import { revalidatePath } from 'next/cache';
import { CONTENT_TYPES, type ContentType } from '@/lib/validation/content';
import { requireAdmin } from '@/server/auth/dal';
import {
  archiveEntry,
  ContentError,
  createEntry,
  deleteEntry,
  getEntry,
  getRevision,
  listRevisions,
  parseDoc,
  publishEntry,
  renameTag,
  restoreEntry,
  restoreRevision,
  saveDraft,
  unpublishEntry,
} from '@/server/repositories/content';

/**
 * CMS Server Actions. Every action re-checks that the caller is an admin, validates the document
 * with the shared zod schema and reports problems as data (never throws to the client).
 */

export type ContentActionResult =
  | { ok: true; id?: string; message?: string; doc?: Record<string, unknown> }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

const fail = (message: string, fieldErrors?: Record<string, string>): ContentActionResult => ({
  ok: false,
  message,
  fieldErrors,
});

/** Runs an action, turning expected errors into a result and refreshing affected pages. */
async function run(fn: () => Promise<ContentActionResult>): Promise<ContentActionResult> {
  try {
    const result = await fn();
    // Admin lists and learner pages (the client content index lives in the root layout).
    revalidatePath('/', 'layout');
    return result;
  } catch (err) {
    if (err instanceof ContentError) return fail(err.message);
    console.error('[content action]', err);
    return fail('Something went wrong. Please try again.');
  }
}

const isType = (t: string): t is ContentType => (CONTENT_TYPES as readonly string[]).includes(t);

function zodToFields(error: { issues: { path: (string | number)[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const i of error.issues) out[i.path.join('.') || 'form'] ??= i.message;
  return out;
}

export async function createContentAction(type: string, doc: unknown): Promise<ContentActionResult> {
  const user = await requireAdmin();
  if (!isType(type) || type === 'taxonomy') return fail('Unknown content type.');
  const parsed = parseDoc(type, doc);
  if (!parsed.ok) return fail('Some fields need attention.', zodToFields(parsed.error));
  return run(async () => ({
    ok: true,
    id: await createEntry(type, parsed.doc, user.id),
    message: 'Draft created.',
  }));
}

export async function saveContentAction(id: string, doc: unknown): Promise<ContentActionResult> {
  const user = await requireAdmin();
  const entry = await getEntry(id);
  if (!entry) return fail('This item no longer exists.');
  const parsed = parseDoc(entry.type, doc);
  if (!parsed.ok) return fail('Some fields need attention.', zodToFields(parsed.error));
  return run(async () => {
    await saveDraft(id, parsed.doc, user.id);
    return { ok: true, message: 'Draft saved.' };
  });
}

/** Saves the given document (if any) and publishes it. */
export async function publishContentAction(id: string, doc?: unknown): Promise<ContentActionResult> {
  const user = await requireAdmin();
  const entry = await getEntry(id);
  if (!entry) return fail('This item no longer exists.');
  if (doc !== undefined) {
    const parsed = parseDoc(entry.type, doc);
    if (!parsed.ok) return fail('Some fields need attention.', zodToFields(parsed.error));
    const saved = await run(async () => {
      await saveDraft(id, parsed.doc, user.id);
      return { ok: true };
    });
    if (!saved.ok) return saved;
  }
  return run(async () => {
    await publishEntry(id, user.id);
    return { ok: true, message: 'Published. Learners see it on their next page load.' };
  });
}

export async function unpublishContentAction(id: string): Promise<ContentActionResult> {
  const user = await requireAdmin();
  return run(async () => {
    await unpublishEntry(id, user.id);
    return { ok: true, message: 'Unpublished. Learners no longer see it.' };
  });
}

export async function archiveContentAction(id: string): Promise<ContentActionResult> {
  const user = await requireAdmin();
  return run(async () => {
    await archiveEntry(id, user.id);
    return { ok: true, message: 'Archived. Learner progress is kept.' };
  });
}

export async function restoreContentAction(id: string): Promise<ContentActionResult> {
  const user = await requireAdmin();
  return run(async () => {
    await restoreEntry(id, user.id);
    return { ok: true, message: 'Restored.' };
  });
}

export async function deleteContentAction(id: string): Promise<ContentActionResult> {
  await requireAdmin();
  return run(async () => {
    await deleteEntry(id);
    return { ok: true, message: 'Deleted.' };
  });
}

export async function bulkContentAction(
  action: 'publish' | 'unpublish' | 'archive' | 'restore',
  ids: string[]
): Promise<ContentActionResult> {
  const user = await requireAdmin();
  const errors: string[] = [];
  for (const id of ids.slice(0, 200)) {
    try {
      if (action === 'publish') await publishEntry(id, user.id);
      else if (action === 'unpublish') await unpublishEntry(id, user.id);
      else if (action === 'archive') await archiveEntry(id, user.id);
      else await restoreEntry(id, user.id);
    } catch (err) {
      const entry = await getEntry(id);
      errors.push(`${entry?.key ?? id}: ${err instanceof ContentError ? err.message : 'failed'}`);
    }
  }
  revalidatePath('/', 'layout');
  const done = ids.length - errors.length;
  return errors.length
    ? fail(`${done} of ${ids.length} done. ${errors.slice(0, 5).join(' ')}`)
    : { ok: true, message: `${done} item${done === 1 ? '' : 's'} updated.` };
}

export async function revisionsAction(id: string) {
  await requireAdmin();
  const rows = await listRevisions(id);
  return rows.map((r) => ({ id: r.id, kind: r.kind, createdAt: r.created_at.toISOString(), by: r.name }));
}

export async function revisionDocAction(id: string, revisionId: string) {
  await requireAdmin();
  return (await getRevision(id, revisionId))?.doc ?? null;
}

export async function restoreRevisionAction(id: string, revisionId: string): Promise<ContentActionResult> {
  const user = await requireAdmin();
  return run(async () => ({
    ok: true,
    doc: await restoreRevision(id, revisionId, user.id),
    message: 'Revision restored into the draft. Publish to make it live.',
  }));
}

export async function renameTagAction(
  kind: 'topics' | 'companies',
  from: string,
  to: string
): Promise<ContentActionResult> {
  const user = await requireAdmin();
  const target = to.trim();
  if (!target) return fail('Enter the new name.');
  return run(async () => {
    await renameTag(kind, from, target, user.id);
    return { ok: true, message: `Renamed "${from}" to "${target}" in every question draft. Publish them to go live.` };
  });
}
