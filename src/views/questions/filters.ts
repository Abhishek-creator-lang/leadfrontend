import type { Difficulty, Importance, QuestionSummary } from '@/content/types';

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

const DIFFICULTY_RANK: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };
const IMPORTANCE_RANK: Record<Importance, number> = { high: 0, mid: 1, low: 2 };

export const SORT_OPTIONS = [
  { value: 'default', label: 'Recommended' },
  { value: 'importance', label: 'Importance' },
  { value: 'difficulty-asc', label: 'Difficulty: easy first' },
  { value: 'difficulty-desc', label: 'Difficulty: hard first' },
  { value: 'duration', label: 'Duration' },
  { value: 'title', label: 'Title' },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]['value'];

const COMPARATORS: Partial<Record<SortKey, (a: QuestionSummary, b: QuestionSummary) => number>> = {
  importance: (a, b) => IMPORTANCE_RANK[a.importance] - IMPORTANCE_RANK[b.importance],
  'difficulty-asc': (a, b) => DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty],
  'difficulty-desc': (a, b) => DIFFICULTY_RANK[b.difficulty] - DIFFICULTY_RANK[a.difficulty],
  duration: (a, b) => a.duration - b.duration,
  title: (a, b) => a.title.localeCompare(b.title),
};

/** Returns a sorted copy; `default` keeps the content order. */
export function sortQuestions(list: QuestionSummary[], sort: string) {
  const compare = COMPARATORS[sort as SortKey];
  return compare ? [...list].sort(compare) : list;
}

export const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'todo', label: 'Not completed' },
] as const;

/** Query-string keys that hold filters (search text and sort order are not counted as filters). */
export const NON_FILTER_PARAMS = new Set(['q', 'sort']);

/** Sorted, de-duplicated values for a filter dropdown. */
export const uniqueSorted = (values: Iterable<string>) => [...new Set(values)].sort();
