import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import {
  replaceProgressAction,
  resetProgressAction,
  setPlanStartedAction,
  syncQuestionAction,
} from '@/app/actions/progress';
import {
  clearDraft,
  importProgress,
  leavePlan,
  type ProgressState,
  resetProgress,
  saveDraft,
  setNote,
  startPlan,
  toggleBookmark,
  toggleComplete,
  visit,
} from './progressSlice';

type State = { progress: ProgressState };

const SYNCED_ACTIONS = isAnyOf(
  toggleComplete,
  toggleBookmark,
  setNote,
  saveDraft,
  clearDraft,
  visit,
  startPlan,
  leavePlan,
  importProgress,
  resetProgress
);

/**
 * Mirrors progress actions of a signed-in user to the database through Server Actions.
 * It sends the resulting state (e.g. "completed: true") rather than the toggle itself, so a retried
 * or duplicated request can't flip the value twice. Debouncing already happens where it matters
 * (notes in NotesTab, drafts in DraftSync).
 */
export function createProgressSync(onError: (error: unknown) => void) {
  const listener = createListenerMiddleware();

  listener.startListening({
    matcher: SYNCED_ACTIONS,
    effect: async (action, api) => {
      const { progress } = api.getState() as State;
      try {
        if (toggleComplete.match(action)) {
          await syncQuestionAction(action.payload, {
            completed: !!progress.completed[action.payload],
          });
        } else if (toggleBookmark.match(action)) {
          await syncQuestionAction(action.payload, {
            bookmarked: !!progress.bookmarked[action.payload],
          });
        } else if (setNote.match(action)) {
          await syncQuestionAction(action.payload.id, {
            note: progress.notes[action.payload.id] ?? null,
          });
        } else if (saveDraft.match(action)) {
          await syncQuestionAction(action.payload.id, { draft: action.payload.files });
        } else if (clearDraft.match(action)) {
          await syncQuestionAction(action.payload, { draft: null });
        } else if (visit.match(action)) {
          await syncQuestionAction(action.payload, { visited: true });
        } else if (startPlan.match(action) || leavePlan.match(action)) {
          await setPlanStartedAction(action.payload, startPlan.match(action));
        } else if (importProgress.match(action)) {
          await replaceProgressAction(progress);
        } else if (resetProgress.match(action)) {
          await resetProgressAction();
        }
      } catch (error) {
        onError(error);
      }
    },
  });

  return listener.middleware;
}
