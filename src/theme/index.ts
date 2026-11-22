import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { getDesignTokens } from './palette';
import typography from './typography';
import { getShadows } from './shadows';
import overrides from './overrides';
import type { ThemeMode } from './tokens';

export const createProjectTheme = (mode: ThemeMode) => {
  let theme = createTheme({
    palette: getDesignTokens(mode),
    typography,
    shadows: getShadows(mode),
    shape: { borderRadius: 8 },
    breakpoints: {
      values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
    },
    spacing: 8,
  });

  theme = responsiveFontSizes(theme, {
    breakpoints: ['xs', 'sm', 'md', 'lg', 'xl'],
    factor: 2.5,
  });

  theme = createTheme(theme, { components: overrides(theme) });

  return theme;
};
