/**
 * Font stacks: the single source for font families. The CSS variables are set by next/font in
 * src/app/layout.tsx; the named fallbacks cover anything rendered outside that tree.
 *
 * Manrope (headings / display) + Inter (UI and body) + JetBrains Mono (code).
 */
export const FONT_BODY =
  'var(--font-inter), "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const FONT_HEADING = `var(--font-heading), "Manrope", ${FONT_BODY}`;

export const FONT_MONO =
  'var(--font-mono), "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
