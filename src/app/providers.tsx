'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { DEBOUNCE_MS } from '@/constants/timing';
import { ProgressHydrationContext } from '@/context/ProgressHydrationContext';
import { ThemeModeProvider } from '@/context/ThemeModeContext';
import { AppStore, loadProgress, makeStore, saveProgress } from '@/store';
import { hydrate } from '@/store/progressSlice';

/** One store per browser tab, filled from localStorage after mount and saved back (debounced). */
function useClientStore(): { store: AppStore; hydrated: boolean } {
  const [store] = useState(makeStore);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Load persisted progress after mount so the server and first client render match.
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

export function Providers({ children }: { children: ReactNode }) {
  const { store, hydrated } = useClientStore();
  return (
    <AppRouterCacheProvider>
      <Provider store={store}>
        <ProgressHydrationContext.Provider value={hydrated}>
          <ThemeModeProvider>{children}</ThemeModeProvider>
        </ProgressHydrationContext.Provider>
      </Provider>
    </AppRouterCacheProvider>
  );
}
