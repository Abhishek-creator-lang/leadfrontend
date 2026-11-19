import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toISODate } from '@/utils/date';

export interface ProgressState {
  /** question id -> ISO date completed */
  completed: Record<string, string>;
  bookmarked: Record<string, true>;
  notes: Record<string, string>;
  /** question id -> { filename -> code } */
  drafts: Record<string, Record<string, string>>;
  /** YYYY-MM-DD -> number of questions completed that day */
  activity: Record<string, number>;
  /** most recently opened questions, newest first */
  recent: string[];
  /** study plans the user has started -> ISO date */
  startedPlans: Record<string, string>;
}

export const initialProgress: ProgressState = {
  completed: {},
  bookmarked: {},
  notes: {},
  drafts: {},
  activity: {},
  recent: [],
  startedPlans: {},
};

const progressSlice = createSlice({
  name: 'progress',
  initialState: initialProgress,
  reducers: {
    toggleComplete(state, { payload: id }: PayloadAction<string>) {
      if (state.completed[id]) {
        delete state.completed[id];
      } else {
        state.completed[id] = new Date().toISOString();
        const d = toISODate();
        state.activity[d] = (state.activity[d] ?? 0) + 1;
      }
    },
    toggleBookmark(state, { payload: id }: PayloadAction<string>) {
      if (state.bookmarked[id]) delete state.bookmarked[id];
      else state.bookmarked[id] = true;
    },
    setNote(state, { payload }: PayloadAction<{ id: string; note: string }>) {
      if (payload.note.trim()) state.notes[payload.id] = payload.note;
      else delete state.notes[payload.id];
    },
    saveDraft(state, { payload }: PayloadAction<{ id: string; files: Record<string, string> }>) {
      state.drafts[payload.id] = payload.files;
    },
    clearDraft(state, { payload: id }: PayloadAction<string>) {
      delete state.drafts[id];
    },
    visit(state, { payload: id }: PayloadAction<string>) {
      state.recent = [id, ...state.recent.filter((r) => r !== id)].slice(0, 20);
    },
    startPlan(state, { payload: id }: PayloadAction<string>) {
      state.startedPlans[id] ??= new Date().toISOString();
    },
    leavePlan(state, { payload: id }: PayloadAction<string>) {
      delete state.startedPlans[id];
    },
    /** Replaces in-memory state with what was persisted in localStorage (dispatched once on mount). */
    hydrate(_state, { payload }: PayloadAction<ProgressState>) {
      return payload;
    },
    importProgress(_state, { payload }: PayloadAction<ProgressState>) {
      return { ...initialProgress, ...payload };
    },
    resetProgress() {
      return initialProgress;
    },
  },
});

export const {
  toggleComplete,
  toggleBookmark,
  setNote,
  saveDraft,
  clearDraft,
  visit,
  startPlan,
  leavePlan,
  hydrate,
  importProgress,
  resetProgress,
} = progressSlice.actions;

export default progressSlice.reducer;

/** Consecutive days (ending today or yesterday) with at least one completion. */
export function currentStreak(activity: Record<string, number>): number {
  let streak = 0;
  const d = new Date();
  if (!activity[toISODate(d)]) d.setDate(d.getDate() - 1);
  while (activity[toISODate(d)]) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
