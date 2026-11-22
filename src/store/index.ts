import { configureStore, type Middleware } from '@reduxjs/toolkit';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { STORAGE_KEYS } from '@/constants/storage';
import progressReducer, { initialProgress, ProgressState } from './progressSlice';

/** Reads guest progress from localStorage. Browser-only: call after mount, never during SSR. */
export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.progress);
    return raw ? { ...initialProgress, ...JSON.parse(raw) } : initialProgress;
  } catch {
    return initialProgress;
  }
}

export function saveProgress(progress: ProgressState) {
  try {
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
  } catch {
    // quota exceeded or storage unavailable — progress stays in memory
  }
}

export function clearSavedProgress() {
  try {
    localStorage.removeItem(STORAGE_KEYS.progress);
  } catch {
    // storage unavailable
  }
}

/** True when the browser holds guest progress worth merging into an account. */
export const hasProgress = (p: ProgressState) =>
  Object.keys(p.completed).length > 0 ||
  Object.keys(p.bookmarked).length > 0 ||
  Object.keys(p.notes).length > 0 ||
  Object.keys(p.drafts).length > 0 ||
  Object.keys(p.startedPlans).length > 0;

/**
 * Creates a store. Signed-in users get their server-loaded progress as `preloaded` plus the sync
 * middleware; guests start empty and load localStorage after mount.
 */
export const makeStore = ({
  preloaded,
  middleware = [],
}: { preloaded?: ProgressState; middleware?: Middleware[] } = {}) =>
  configureStore({
    reducer: { progress: progressReducer },
    preloadedState: preloaded ? { progress: preloaded } : undefined,
    middleware: (getDefault) => getDefault().prepend(...middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
