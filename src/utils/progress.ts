import type { StudyPlan } from '@/content/types';
import { getQuestion } from '@/content';

type CompletedMap = Record<string, unknown>;

/** How many of `ids` are marked complete. */
export const countCompleted = (ids: readonly string[], completed: CompletedMap) =>
  ids.filter((id) => completed[id]).length;

/** `done / total` as a 0–100 percentage; 0 when there is nothing to do. */
export const percent = (done: number, total: number) => (total ? (done / total) * 100 : 0);

/** Every question id in a study plan, in section order. */
export const planQuestionIds = (plan: StudyPlan) => plan.sections.flatMap((s) => s.questions);

/** Total estimated minutes for a list of question ids. */
export const totalMinutes = (ids: readonly string[]) =>
  ids.reduce((sum, id) => sum + (getQuestion(id)?.duration ?? 0), 0);

export const formatHours = (mins: number) =>
  mins < 60 ? `${mins} min` : `${Math.round(mins / 6) / 10} hrs`;
