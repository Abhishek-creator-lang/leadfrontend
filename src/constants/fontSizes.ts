// Breakpoints: xs: 0px+  sm: 600px+  md: 900px+  lg: 1200px+  xl: 1536px+

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export type BreakpointSizes = { xs: number; sm: number; md: number; lg: number; xl: number };

export const RESPONSIVE_FONT_SIZES: Record<string, BreakpointSizes> = {
  h1: { xs: 28, sm: 32, md: 38, lg: 42, xl: 48 },
  h2: { xs: 24, sm: 28, md: 32, lg: 36, xl: 40 },
  h3: { xs: 20, sm: 22, md: 26, lg: 30, xl: 34 },
  h4: { xs: 18, sm: 20, md: 22, lg: 24, xl: 28 },
  h5: { xs: 16, sm: 17, md: 18, lg: 20, xl: 22 },
  h6: { xs: 14, sm: 15, md: 16, lg: 18, xl: 20 },
  body1: { xs: 13, sm: 14, md: 15, lg: 16, xl: 16 },
  body2: { xs: 11, sm: 12, md: 13, lg: 14, xl: 14 },
  caption: { xs: 10, sm: 10, md: 11, lg: 12, xl: 12 },
  overline: { xs: 10, sm: 10, md: 11, lg: 12, xl: 12 },
  subtitle1: { xs: 14, sm: 15, md: 15, lg: 16, xl: 16 },
  subtitle2: { xs: 12, sm: 13, md: 13, lg: 14, xl: 14 },
};

export const LINE_HEIGHTS = {
  tight: 1.2,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.6,
  loose: 1.8,
} as const;

export const FONT_WEIGHTS = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;
