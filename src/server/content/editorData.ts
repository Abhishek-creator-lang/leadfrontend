import 'server-only';
import { DOC_SCHEMAS, TAXONOMY_KEY, type ContentType, type TaxonomyDoc } from '@/lib/validation/content';
import { getEntry, getEntryByKey, questionOptions, type EntryRow, type EntryStatus } from '../repositories/content';

/** Learner URL of a published entry (for "View live"). */
export function livePathOf(type: ContentType, key: string, doc: Record<string, unknown>) {
  switch (type) {
    case 'question':
      return `/questions/${key}`;
    case 'guide':
      return `/guides/${key}`;
    case 'study_plan':
      return `/study-plans/${key}`;
    case 'focus_area':
      return `/focus-areas/${key}`;
    case 'company':
      return `/companies/${key}`;
    default:
      void doc;
      return undefined;
  }
}

export function statusOf(e: Pick<EntryRow, 'archived_at' | 'published' | 'draft'>): EntryStatus {
  if (e.archived_at) return 'archived';
  if (!e.published) return 'draft';
  return JSON.stringify(e.draft) === JSON.stringify(e.published) ? 'published' : 'changed';
}

/** Everything the editor page needs besides the document itself. */
export async function editorExtras(type: ContentType) {
  const needsQuestions = type === 'study_plan' || type === 'focus_area';
  const [questions, taxonomy] = await Promise.all([
    needsQuestions ? questionOptions() : Promise.resolve([]),
    type === 'question' ? getEntryByKey('taxonomy', TAXONOMY_KEY) : Promise.resolve(undefined),
  ]);
  const tags = (taxonomy?.draft ?? { topics: [], companies: [] }) as TaxonomyDoc;
  return { questions, topics: tags.topics, companies: tags.companies };
}

/** The stored draft, normalised through the schema (fills defaults for older documents). */
export async function loadEditorEntry(id: string) {
  const entry = await getEntry(id);
  if (!entry) return null;
  const parsed = DOC_SCHEMAS[entry.type].safeParse(entry.draft);
  return { entry, doc: (parsed.success ? parsed.data : entry.draft) as Record<string, unknown> };
}
