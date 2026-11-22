import { useTheme } from '@mui/material/styles';
import { getTokens, type ThemeMode } from '@/theme/tokens';

/** Design tokens for the current color mode (surfaces, text, brand, status, format colors…). */
export const useModeColors = () => getTokens(useTheme().palette.mode as ThemeMode);
