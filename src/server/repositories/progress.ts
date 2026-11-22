import 'server-only';
import type { Knex } from 'knex';
import { initialProgress, type ProgressState } from '@/store/progressSlice';
import { toISODate } from '@/utils/date';
import { db } from '../db';

interface QuestionProgressRow {
  user_id: string;
  question_id: string;
  completed_at: Date | null;
  bookmarked: boolean;
  note: string | null;
  draft: Record<string, string> | null;
  last_visited_at: Date | null;
  updated_at: Date;
}

const RECENT_LIMIT = 20;
const CHUNK = 500;

/** A user's progress in the same shape the client store uses (`ProgressState`). */
export async function loadUserProgress(userId: string): Promise<ProgressState> {
  const [rows, plans] = await Promise.all([
    db<QuestionProgressRow>('question_progress').where({ user_id: userId }),
    db('started_plans')
      .where({ user_id: userId })
      .select<{ plan_id: string; started_at: Date }[]>(),
  ]);

  const state: ProgressState = structuredClone(initialProgress);
  for (const r of rows) {
    if (r.completed_at) {
      state.completed[r.question_id] = r.completed_at.toISOString();
      const day = toISODate(r.completed_at);
      state.activity[day] = (state.activity[day] ?? 0) + 1;
    }
    if (r.bookmarked) state.bookmarked[r.question_id] = true;
    if (r.note) state.notes[r.question_id] = r.note;
    if (r.draft) state.drafts[r.question_id] = r.draft;
  }
  state.recent = rows
    .filter((r) => r.last_visited_at)
    .sort((a, b) => b.last_visited_at!.getTime() - a.last_visited_at!.getTime())
    .slice(0, RECENT_LIMIT)
    .map((r) => r.question_id);
  for (const p of plans) state.startedPlans[p.plan_id] = p.started_at.toISOString();
  return state;
}

type QuestionPatch = Partial<
  Pick<QuestionProgressRow, 'completed_at' | 'bookmarked' | 'note' | 'last_visited_at'>
> & { draft?: Record<string, string> | null };

/** Insert-or-update one (user, question) row with only the given columns. */
export async function upsertQuestionProgress(
  userId: string,
  questionId: string,
  patch: QuestionPatch
) {
  const values = {
    ...patch,
    ...(patch.draft !== undefined
      ? { draft: patch.draft === null ? null : JSON.stringify(patch.draft) }
      : {}),
    updated_at: db.fn.now(),
  };
  await db('question_progress')
    .insert({ user_id: userId, question_id: questionId, ...values })
    .onConflict(['user_id', 'question_id'])
    .merge(values);
}

export async function setPlanStarted(userId: string, planId: string, started: boolean) {
  if (started) {
    await db('started_plans')
      .insert({ user_id: userId, plan_id: planId })
      .onConflict(['user_id', 'plan_id'])
      .ignore();
  } else {
    await db('started_plans').where({ user_id: userId, plan_id: planId }).delete();
  }
}

export async function resetUserProgress(userId: string, trx: Knex = db) {
  await trx('question_progress').where({ user_id: userId }).delete();
  await trx('started_plans').where({ user_id: userId }).delete();
}

function rowsFromState(userId: string, state: ProgressState) {
  const ids = new Set([
    ...Object.keys(state.completed),
    ...Object.keys(state.bookmarked),
    ...Object.keys(state.notes),
    ...Object.keys(state.drafts),
    ...state.recent,
  ]);
  const visitedAt = new Map(state.recent.map((id, i) => [id, new Date(Date.now() - i * 1000)]));
  return [...ids].map((id) => ({
    user_id: userId,
    question_id: id,
    completed_at: state.completed[id] ? new Date(state.completed[id]) : null,
    bookmarked: !!state.bookmarked[id],
    note: state.notes[id] ?? null,
    draft: state.drafts[id] ? JSON.stringify(state.drafts[id]) : null,
    last_visited_at: visitedAt.get(id) ?? null,
  }));
}

function planRowsFromState(userId: string, state: ProgressState) {
  return Object.entries(state.startedPlans).map(([planId, at]) => ({
    user_id: userId,
    plan_id: planId,
    started_at: new Date(at),
  }));
}

/** Replaces all of a user's progress (Settings → Import while signed in). */
export async function replaceUserProgress(userId: string, state: ProgressState) {
  await db.transaction(async (trx) => {
    await resetUserProgress(userId, trx);
    const rows = rowsFromState(userId, state);
    for (let i = 0; i < rows.length; i += CHUNK)
      await trx('question_progress').insert(rows.slice(i, i + CHUNK));
    const plans = planRowsFromState(userId, state);
    if (plans.length) await trx('started_plans').insert(plans);
  });
}

/**
 * Merges guest (localStorage) progress into an account after sign-in. Existing account data wins;
 * the guest data only fills gaps (completions and bookmarks are unioned).
 */
export async function mergeUserProgress(userId: string, state: ProgressState) {
  const rows = rowsFromState(userId, state);
  await db.transaction(async (trx) => {
    for (let i = 0; i < rows.length; i += CHUNK) {
      await trx('question_progress')
        .insert(rows.slice(i, i + CHUNK))
        .onConflict(['user_id', 'question_id'])
        .merge({
          completed_at: trx.raw('coalesce(question_progress.completed_at, excluded.completed_at)'),
          bookmarked: trx.raw('question_progress.bookmarked or excluded.bookmarked'),
          note: trx.raw('coalesce(question_progress.note, excluded.note)'),
          draft: trx.raw('coalesce(question_progress.draft, excluded.draft)'),
          last_visited_at: trx.raw(
            'greatest(question_progress.last_visited_at, excluded.last_visited_at)'
          ),
          updated_at: trx.fn.now(),
        });
    }
    const plans = planRowsFromState(userId, state);
    if (plans.length)
      await trx('started_plans').insert(plans).onConflict(['user_id', 'plan_id']).ignore();
  });
}

/** Platform-wide learner activity for the admin overview. */
export async function progressOverview() {
  const [[active], topCompleted] = await Promise.all([
    db('question_progress')
      .where('updated_at', '>', db.raw("now() - interval '7 days'"))
      .countDistinct<{ count: string }[]>({ count: 'user_id' }),
    db('question_progress')
      .whereNotNull('completed_at')
      .select('question_id')
      .count<{ question_id: string; count: string }[]>({ count: '*' })
      .groupBy('question_id')
      .orderBy('count', 'desc')
      .limit(5),
  ]);
  return {
    activeLearners7d: Number(active.count),
    topCompleted: topCompleted.map((r) => ({ questionId: r.question_id, count: Number(r.count) })),
  };
}
