import { PaletteOptions } from '@mui/material/styles';
import { BRAND_COLORS, ThemeMode, getModeColors } from '../constants/colors';

export const getDesignTokens = (mode: ThemeMode): PaletteOptions => {
  const mc = getModeColors(mode);
  return {
    mode,
    primary: {
      main: BRAND_COLORS.primary,
      light: BRAND_COLORS.primaryLight,
      dark: BRAND_COLORS.primaryDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: BRAND_COLORS.secondary,
      light: BRAND_COLORS.secondaryLight,
      dark: BRAND_COLORS.secondaryDark,
      contrastText: '#FFFFFF',
    },
    success: {
      main: BRAND_COLORS.success,
      light: BRAND_COLORS.successLight,
      contrastText: '#FFFFFF',
    },
    warning: {
      main: BRAND_COLORS.warning,
      light: BRAND_COLORS.warningLight,
      contrastText: '#FFFFFF',
    },
    error: { main: BRAND_COLORS.error, light: BRAND_COLORS.errorLight, contrastText: '#FFFFFF' },
    info: { main: BRAND_COLORS.info, light: BRAND_COLORS.infoLight, contrastText: '#FFFFFF' },
    background: { default: mc.bgDefault, paper: mc.bgPaper },
    text: { primary: mc.textPrimary, secondary: mc.textSecondary, disabled: mc.textDisabled },
    divider: mc.borderLight,
  };
};
