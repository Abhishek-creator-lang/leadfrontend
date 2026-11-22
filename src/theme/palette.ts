import { alpha, PaletteOptions } from '@mui/material/styles';
import { getTokens, type ThemeMode } from './tokens';

/** MUI palette built from the design tokens (src/theme/tokens.ts). */
export const getDesignTokens = (mode: ThemeMode): PaletteOptions => {
  const t = getTokens(mode);
  const status = (main: string) => ({ main, contrastText: t.statusContrast });
  return {
    mode,
    primary: {
      main: t.primary,
      light: t.primaryLight,
      dark: t.primaryDark,
      contrastText: t.primaryContrast,
    },
    secondary: {
      main: t.secondary,
      light: t.secondaryLight,
      dark: t.secondaryDark,
      contrastText: t.secondaryContrast,
    },
    success: status(t.success),
    warning: status(t.warning),
    error: status(t.error),
    info: status(t.info),
    background: { default: t.bgDefault, paper: t.bgPaper },
    text: { primary: t.textPrimary, secondary: t.textSecondary, disabled: t.textDisabled },
    divider: t.borderLight,
    action: {
      hover: alpha(t.textPrimary, mode === 'light' ? 0.04 : 0.06),
      selected: t.primaryLight,
      focus: alpha(t.primary, 0.24),
    },
    format: t.format,
    difficulty: t.difficulty,
  };
};
