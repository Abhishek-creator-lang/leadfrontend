// Theme tokens. Structure adapted from mt-business-frontend/src/constants/colors.ts.
export type ThemeMode = 'light' | 'dark';

export const BRAND_COLORS = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  secondary: '#14B8A6',
  secondaryLight: '#5EEAD4',
  secondaryDark: '#0F766E',
  success: '#16A34A',
  successLight: '#22C55E',
  warning: '#D97706',
  warningLight: '#F59E0B',
  error: '#DC2626',
  errorLight: '#EF4444',
  info: '#0284C7',
  infoLight: '#38BDF8',
  easy: '#16A34A',
  medium: '#D97706',
  hard: '#DC2626',
  streak: '#F97316',
} as const;

export const LIGHT_COLORS = {
  bgDefault: '#F8FAFC',
  bgPaper: '#FFFFFF',
  bgSubtle: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textDisabled: '#94A3B8',
  borderLight: '#E2E8F0',
  sidebarBg: '#FFFFFF',
  codeBg: '#F1F5F9',
};

export const DARK_COLORS: typeof LIGHT_COLORS = {
  bgDefault: '#0B0F19',
  bgPaper: '#111827',
  bgSubtle: '#1F2937',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textDisabled: '#64748B',
  borderLight: '#1F2937',
  sidebarBg: '#0F1422',
  codeBg: '#0F172A',
};

export const getModeColors = (mode: ThemeMode) => (mode === 'light' ? LIGHT_COLORS : DARK_COLORS);
