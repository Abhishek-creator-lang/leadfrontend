'use server';

import { getQuestion, getStudyPlan } from '@/content';
import {
  progressStateSchema,
  questionPatchSchema,
  type QuestionPatchInput,
} from '@/lib/validation/progress';
import { getCurrentUser } from '@/server/auth/dal';
import {
  loadUserProgress,
  mergeUserProgress,
  replaceUserProgress,
  resetUserProgress,
  setPlanStarted,
  upsertQuestionProgress,
} from '@/server/repositories/progress';
import type { ProgressState } from '@/store/progressSlice';

/**
 * Server Actions that persist the signed-in learner's progress. The client store stays the source of
 * truth for the UI; `src/store/progressSync.ts` mirrors each change here. Every action re-checks the
 * session and validates its input, since anything can call a Server Action.
 */

async function userId() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not signed in');
  return user.id;
}

/** Drops ids that are not in the content index (renamed or made-up questions/plans). */
function sanitize(state: ProgressState): ProgressState {
  const keepQuestions = <T>(r: Record<string, T>) =>
    Object.fromEntries(Object.entries(r).filter(([id]) => getQuestion(id)));
  return {
    completed: keepQuestions(state.completed),
    bookmarked: keepQuestions(state.bookmarked),
    notes: keepQuestions(state.notes),
    drafts: keepQuestions(state.drafts),
    activity: state.activity,
    recent: state.recent.filter((id) => getQuestion(id)),
    startedPlans: Object.fromEntries(
      Object.entries(state.startedPlans).filter(([id]) => getStudyPlan(id))
    ),
  };
}

export async function syncQuestionAction(questionId: string, patch: QuestionPatchInput) {
  const uid = await userId();
  if (!getQuestion(questionId)) throw new Error('Unknown question');
  const p = questionPatchSchema.parse(patch);
  const now = new Date();
  await upsertQuestionProgress(uid, questionId, {
    ...(p.completed !== undefined && { completed_at: p.completed ? now : null }),
    ...(p.bookmarked !== undefined && { bookmarked: p.bookmarked }),
    ...(p.note !== undefined && { note: p.note || null }),
    ...(p.draft !== undefined && { draft: p.draft }),
    ...(p.visited && { last_visited_at: now }),
  });
}

export async function setPlanStartedAction(planId: string, started: boolean) {
  const uid = await userId();
  if (!getStudyPlan(planId)) throw new Error('Unknown study plan');
  await setPlanStarted(uid, planId, started);
}

/** Settings → Import while signed in: replaces the account's progress. */
export async function replaceProgressAction(state: ProgressState) {
  const uid = await userId();
  await replaceUserProgress(uid, sanitize(progressStateSchema.parse(state)));
}

/** Settings → Reset while signed in. */
export async function resetProgressAction() {
  await resetUserProgress(await userId());
}

/**
 * Called once after sign-in when the browser still has guest progress in localStorage. Merges it into
 * the account and returns the combined progress for the store.
 */
export async function mergeGuestProgressAction(state: ProgressState): Promise<ProgressState> {
  const uid = await userId();
  await mergeUserProgress(uid, sanitize(progressStateSchema.parse(state)));
  return loadUserProgress(uid);
}
