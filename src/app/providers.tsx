'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { Alert, Snackbar } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { mergeGuestProgressAction } from '@/app/actions/progress';
import type { SessionUser } from '@/constants/roles';
import { DEBOUNCE_MS } from '@/constants/timing';
import { ProgressHydrationContext } from '@/context/ProgressHydrationContext';
import { ContentProvider } from '@/context/ContentContext';
import type { ClientContentIndex } from '@/content/types';
import { SessionContext } from '@/context/SessionContext';
import { SupportContext } from '@/context/SupportContext';
import type { SupportSettings } from '@/lib/validation/support';
import { ThemeModeProvider } from '@/context/ThemeModeContext';
import {
  AppStore,
  clearSavedProgress,
  hasProgress,
  loadProgress,
  makeStore,
  saveProgress,
} from '@/store';
import { hydrate, type ProgressState } from '@/store/progressSlice';
import { createProgressSync } from '@/store/progressSync';

/** Guest: progress lives in localStorage, loaded after mount and saved back (debounced). */
function useGuestStore(): { store: AppStore; hydrated: boolean } {
  const [store] = useState(() => makeStore());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Load after mount so the server render and the first client render match.
    store.dispatch(hydrate(loadProgress()));
    setHydrated(true);

    let timer: number | undefined;
    const unsubscribe = store.subscribe(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => saveProgress(store.getState().progress), DEBOUNCE_MS.persist);
    });
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [store]);

  return { store, hydrated };
}

/**
 * Signed in: the store starts with the progress the server loaded, and every change is mirrored to
 * the database. Guest progress left in localStorage is merged into the account once.
 */
function useAccountStore(initialProgress: ProgressState, onSyncError: () => void): AppStore {
  const [store] = useState(() =>
    makeStore({ preloaded: initialProgress, middleware: [createProgressSync(onSyncError)] })
  );

  useEffect(() => {
    const guest = loadProgress();
    if (!hasProgress(guest)) return;
    mergeGuestProgressAction(guest)
      .then((merged) => {
        store.dispatch(hydrate(merged));
        clearSavedProgress();
      })
      .catch(onSyncError);
    // Runs once per account store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  return store;
}

function GuestProviders({ children }: { children: ReactNode }) {
  const { store, hydrated } = useGuestStore();
  return (
    <Provider store={store}>
      <ProgressHydrationContext.Provider value={hydrated}>
        {children}
      </ProgressHydrationContext.Provider>
    </Provider>
  );
}

function AccountProviders({
  initialProgress,
  children,
}: {
  initialProgress: ProgressState;
  children: ReactNode;
}) {
  const [syncFailed, setSyncFailed] = useState(false);
  const store = useAccountStore(initialProgress, () => setSyncFailed(true));
  return (
    <Provider store={store}>
      {/* Server-loaded progress is available from the first render. */}
      <ProgressHydrationContext.Provider value>{children}</ProgressHydrationContext.Provider>
      <Snackbar open={syncFailed} onClose={() => setSyncFailed(false)} autoHideDuration={6000}>
        <Alert severity="error" onClose={() => setSyncFailed(false)}>
          Could not save your progress. Check your connection and reload the page.
        </Alert>
      </Snackbar>
    </Provider>
  );
}

/**
 * Root client providers. The root layout passes `key={user?.id}` so signing in or out builds a fresh
 * store instead of mixing one person's progress into another's.
 */
export function Providers({
  user,
  initialProgress,
  content,
  support,
  children,
}: {
  user: SessionUser | null;
  initialProgress: ProgressState | null;
  /** Published content index, loaded from the database by the root layout. */
  content: ClientContentIndex;
  /** Active "Buy me a coffee" settings, or null when off. */
  support: SupportSettings | null;
  children: ReactNode;
}) {
  return (
    <AppRouterCacheProvider>
      <ThemeModeProvider>
        <SessionContext.Provider value={user}>
          <ContentProvider content={content}>
            <SupportContext.Provider value={support}>
              {user && initialProgress ? (
                <AccountProviders initialProgress={initialProgress}>{children}</AccountProviders>
              ) : (
                <GuestProviders>{children}</GuestProviders>
              )}
            </SupportContext.Provider>
          </ContentProvider>
        </SessionContext.Provider>
      </ThemeModeProvider>
    </AppRouterCacheProvider>
  );
}
