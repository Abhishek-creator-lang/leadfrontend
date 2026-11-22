import { Shadows } from '@mui/material/styles';
import { getTokens, type ThemeMode } from './tokens';

/**
 * Elevation scale (MUI needs 25 levels): plain neutral shadows, used only by floating surfaces
 * (menus, popovers, dialogs). Cards and buttons stay flat.
 */
function scale(rgb: string, strength: number): Shadows {
  return [
    'none',
    ...Array.from({ length: 24 }, (_, i) => {
      const level = i + 1;
      const y = Math.ceil(level / 2);
      const blur = level * 2 + 2;
      const a = Math.min(0.06 + level * 0.005, 0.16) * strength;
      return `0px ${y}px ${blur}px rgba(${rgb}, ${a.toFixed(3)})`;
    }),
  ] as Shadows;
}

export const getShadows = (mode: ThemeMode): Shadows =>
  scale(getTokens(mode).shadowRgb, mode === 'light' ? 1 : 2.5);

export default getShadows('light');
