import type { Difficulty, Format } from '@/content/types';

/**
 * Custom palette keys, so components can use theme colors for content types:
 *   sx={{ color: 'format.quiz' }}            theme.palette.difficulty.hard
 */
declare module '@mui/material/styles' {
  interface Palette {
    format: Record<Format, string>;
    difficulty: Record<Difficulty, string>;
  }
  interface PaletteOptions {
    format?: Record<Format, string>;
    difficulty?: Record<Difficulty, string>;
  }
}
