import { Shadows } from '@mui/material/styles';
import { ThemeMode } from '../constants/colors';

const lightShadows: Shadows = [
  'none',
  '0px 1px 2px rgba(0, 0, 0, 0.08)',
  '0px 1px 4px rgba(0, 0, 0, 0.10)',
  '0px 2px 8px rgba(0, 0, 0, 0.10)',
  '0px 4px 12px rgba(0, 0, 0, 0.10)',
  '0px 6px 16px rgba(0, 0, 0, 0.10)',
  '0px 8px 24px rgba(0, 0, 0, 0.10)',
  '0px 10px 28px rgba(0, 0, 0, 0.12)',
  '0px 12px 32px rgba(0, 0, 0, 0.12)',
  '0px 14px 36px rgba(0, 0, 0, 0.12)',
  '0px 16px 40px rgba(0, 0, 0, 0.12)',
  '0px 18px 44px rgba(0, 0, 0, 0.14)',
  '0px 20px 48px rgba(0, 0, 0, 0.14)',
  '0px 22px 52px rgba(0, 0, 0, 0.14)',
  '0px 24px 56px rgba(0, 0, 0, 0.14)',
  '0px 26px 60px rgba(0, 0, 0, 0.16)',
  '0px 28px 64px rgba(0, 0, 0, 0.16)',
  '0px 30px 68px rgba(0, 0, 0, 0.16)',
  '0px 32px 72px rgba(0, 0, 0, 0.16)',
  '0px 34px 76px rgba(0, 0, 0, 0.18)',
  '0px 36px 80px rgba(0, 0, 0, 0.18)',
  '0px 38px 84px rgba(0, 0, 0, 0.18)',
  '0px 40px 88px rgba(0, 0, 0, 0.20)',
  '0px 42px 92px rgba(0, 0, 0, 0.20)',
  '0px 44px 96px rgba(0, 0, 0, 0.20)',
];

// Dark mode: stronger shadow opacities for visible depth on dark surfaces
const darkShadows: Shadows = [
  'none',
  '0px 1px 2px rgba(0, 0, 0, 0.20)',
  '0px 1px 4px rgba(0, 0, 0, 0.24)',
  '0px 2px 8px rgba(0, 0, 0, 0.24)',
  '0px 4px 12px rgba(0, 0, 0, 0.24)',
  '0px 6px 16px rgba(0, 0, 0, 0.24)',
  '0px 8px 24px rgba(0, 0, 0, 0.26)',
  '0px 10px 28px rgba(0, 0, 0, 0.28)',
  '0px 12px 32px rgba(0, 0, 0, 0.28)',
  '0px 14px 36px rgba(0, 0, 0, 0.28)',
  '0px 16px 40px rgba(0, 0, 0, 0.30)',
  '0px 18px 44px rgba(0, 0, 0, 0.32)',
  '0px 20px 48px rgba(0, 0, 0, 0.32)',
  '0px 22px 52px rgba(0, 0, 0, 0.32)',
  '0px 24px 56px rgba(0, 0, 0, 0.34)',
  '0px 26px 60px rgba(0, 0, 0, 0.36)',
  '0px 28px 64px rgba(0, 0, 0, 0.36)',
  '0px 30px 68px rgba(0, 0, 0, 0.36)',
  '0px 32px 72px rgba(0, 0, 0, 0.38)',
  '0px 34px 76px rgba(0, 0, 0, 0.40)',
  '0px 36px 80px rgba(0, 0, 0, 0.40)',
  '0px 38px 84px rgba(0, 0, 0, 0.40)',
  '0px 40px 88px rgba(0, 0, 0, 0.42)',
  '0px 42px 92px rgba(0, 0, 0, 0.42)',
  '0px 44px 96px rgba(0, 0, 0, 0.44)',
];

export const getShadows = (mode: ThemeMode): Shadows =>
  mode === 'light' ? lightShadows : darkShadows;

// Default export for backward compatibility
const shadows: Shadows = lightShadows;
export default shadows;
