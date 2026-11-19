'use client';

import { createContext, useState, useMemo, useEffect, useCallback, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { createProjectTheme } from '@/theme/index';
import { ThemeMode } from '@/constants/colors';
import { STORAGE_KEYS } from '@/constants/storage';

interface ThemeModeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const ThemeModeContext = createContext<ThemeModeContextType>({
  mode: 'light',
  toggleTheme: () => {},
  setMode: () => {},
});

function readInitialMode(): ThemeMode {
  const fromDom = document.documentElement.dataset.theme;
  if (fromDom === 'light' || fromDom === 'dark') return fromDom;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  // The server always renders light; the stored preference is applied right after hydration.
  const [mode, setMode] = useState<ThemeMode>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMode(readInitialMode());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEYS.themeMode, mode);
    } catch {
      // storage unavailable
    }
    document.documentElement.dataset.theme = mode;
  }, [mode, ready]);

  const toggleTheme = useCallback(() => setMode((p) => (p === 'light' ? 'dark' : 'light')), []);
  const theme = useMemo(() => createProjectTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggleTheme, setMode }), [mode, toggleTheme]);

  return (
    <ThemeModeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
}
