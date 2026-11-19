export const APP_BAR_HEIGHT = 56;
export const DRAWER_WIDTH = 248;

/** Height of the viewport below the fixed app bar. */
export const FULL_HEIGHT_BELOW_APP_BAR = `calc(100vh - ${APP_BAR_HEIGHT}px)`;

/** Max content widths (px) used by `<Page maxWidth>` and reading layouts. */
export const CONTENT_MAX_WIDTH = {
  default: 1200,
  wide: 1280,
  narrow: 1000,
  reading: 900,
  form: 800,
} as const;
