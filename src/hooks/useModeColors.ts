import { useTheme } from '@mui/material/styles';
import { BRAND_COLORS, ThemeMode, getModeColors } from '../constants/colors';

/** Mode-aware color tokens (brand + light/dark surface tokens). */
export const useModeColors = () => {
  const theme = useTheme();
  return { ...BRAND_COLORS, ...getModeColors(theme.palette.mode as ThemeMode) };
};
