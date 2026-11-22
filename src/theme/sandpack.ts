import type { SandpackTheme } from '@codesandbox/sandpack-react';
import { getTokens, type ThemeMode } from './tokens';
import { FONT_BODY, FONT_MONO } from './fonts';

/**
 * Sandpack (code editor, preview chrome, tests, console) themed from the design tokens, so the coding
 * workspace matches the rest of the app in both modes. Syntax colors reuse the palette's accents.
 */
export function sandpackTheme(mode: ThemeMode): SandpackTheme {
  const t = getTokens(mode);
  return {
    colors: {
      surface1: t.bgPaper,
      surface2: t.borderLight,
      surface3: t.bgSubtle,
      disabled: t.textDisabled,
      base: t.textSecondary,
      clickable: t.textSecondary,
      hover: t.textPrimary,
      accent: t.primaryText,
      error: t.error,
      errorSurface: t.bgSubtle,
      warning: t.warning,
      warningSurface: t.bgSubtle,
    },
    syntax: {
      plain: t.textPrimary,
      comment: { color: t.textDisabled, fontStyle: 'italic' },
      keyword: t.format['system-design'],
      tag: t.format['user-interface'],
      punctuation: t.textSecondary,
      definition: t.format.javascript,
      property: t.info,
      static: t.format.algorithms,
      string: t.format.quiz,
    },
    font: {
      body: FONT_BODY,
      mono: FONT_MONO,
      size: '13px',
      lineHeight: '20px',
    },
  };
}
