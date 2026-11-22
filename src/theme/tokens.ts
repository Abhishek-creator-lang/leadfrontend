/**
 * Design tokens: the only place in the app that defines colors.
 *
 * Direction: a calm, product-like look (after the mt-learner-frontend Figma palette). Warm cream page,
 * flat white cards with thin grey borders, gold as the primary fill with black text, teal as the
 * secondary color. Gold and teal are fills only; text uses the darker `*Text` shades.
 * Every text/UI pair is checked against WCAG 2.1 AA by `npm run check:contrast`.
 */
import type { Difficulty, Format } from '@/content/types';

export type ThemeMode = 'light' | 'dark';

/** Brand fills (Figma: appPrimary / appSecondary / appBlack). */
export const BRAND = {
  gold: '#EEB444',
  teal: '#54C5AC',
  black: '#121416',
} as const;

/** Soft vertical gradients, after the reference design (gold / teal / cream). Fills only. */
export interface Gradients {
  goldButton: string;
  goldButtonHover: string;
  tealButton: string;
  tealButtonHover: string;
  disabledButton: string;
  /** Cream section panel. */
  goldPanel: string;
  /** White to pale gold: icon tiles, badges. */
  goldCard: string;
  /** Selected nav items. */
  goldSelected: string;
  /** Active toggles / tabs. */
  goldActive: string;
  tealPanel: string;
  /** 1px gradient border around teal panels. */
  tealBorder: string;
  authBg: string;
  /** Horizontal progress bars. */
  progress: string;
}

const v = (from: string, to: string, angle = 180) =>
  `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;

type Status = 'success' | 'warning' | 'error' | 'info';

export interface ColorTokens {
  // Surfaces
  bgDefault: string;
  bgPaper: string;
  /** Hover rows, inline code, progress tracks. */
  bgSubtle: string;
  sidebarBg: string;
  appBarBg: string;
  /** Dividers and card borders. */
  borderLight: string;
  /** Input and button borders. */
  borderStrong: string;
  tableHeader: string;
  searchBg: string;
  searchBorder: string;
  // Text
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  // Brand
  /** Gold fill (contained buttons, progress, indicators). */
  primary: string;
  /** Pale gold: selected nav items, icon tiles. */
  primaryLight: string;
  /** Gold hover. */
  primaryDark: string;
  /** Outlined-button border. */
  primaryBorder: string;
  /** Gold-family text (links, text/outlined buttons). */
  primaryText: string;
  primaryContrast: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  secondaryBorder: string;
  secondaryText: string;
  secondaryContrast: string;
  streak: string;
  // Status
  success: string;
  warning: string;
  error: string;
  info: string;
  /** Text on top of a filled status color. */
  statusContrast: string;
  /** Light status backgrounds (alerts). */
  statusBg: Record<Status, string>;
  /** Keyboard focus ring (≥ 3:1 on every surface). */
  focusRing: string;
  // Code
  codeBg: string;
  codeBlockBg: string;
  codeBlockText: string;
  // Content-specific
  difficulty: Record<Difficulty, string>;
  format: Record<Format, string>;
  /** Shadow color as "r, g, b". */
  gradient: Gradients;
  shadowRgb: string;
  /** Browser UI color (mobile address bar). */
  themeColor: string;
}

const LIGHT_STATUS = { success: '#2A7438', warning: '#993E00', error: '#BF2A2D', info: '#196655' };

export const LIGHT_TOKENS: ColorTokens = {
  bgDefault: '#FEFBF6',
  bgPaper: '#FFFFFF',
  bgSubtle: '#F2F3F4',
  sidebarBg: '#FFFFFF',
  appBarBg: '#FFFFFF',
  borderLight: '#E3E5E8',
  borderStrong: '#D1D3D6',
  tableHeader: '#FCEBCF',
  searchBg: '#ECF9F6',
  searchBorder: '#A0DED1',

  textPrimary: BRAND.black,
  textSecondary: '#5F636D',
  textDisabled: '#868A93',

  primary: BRAND.gold,
  primaryLight: '#FDF1DD',
  primaryDark: '#DD9E22',
  primaryBorder: '#C38409',
  primaryText: '#8A5B00',
  primaryContrast: BRAND.black,
  secondary: BRAND.teal,
  secondaryLight: '#C6ECE3',
  secondaryDark: '#2EB899',
  secondaryBorder: '#248F77',
  secondaryText: '#196655',
  secondaryContrast: BRAND.black,
  streak: '#FF8833',

  ...LIGHT_STATUS,
  statusContrast: '#FFFFFF',
  statusBg: { success: '#EDF8EE', warning: '#FFF3EB', error: '#FFF0F0', info: '#ECF9F6' },
  focusRing: '#8A5B00',

  codeBg: '#F2F3F4',
  codeBlockBg: '#1E2024',
  codeBlockText: '#E3E5E8',

  difficulty: {
    easy: LIGHT_STATUS.success,
    medium: LIGHT_STATUS.warning,
    hard: LIGHT_STATUS.error,
  },
  format: {
    javascript: '#8A5B00',
    'user-interface': '#1D5FA8',
    algorithms: '#A23B6B',
    quiz: '#196655',
    'system-design': '#5B4BA8',
    behavioral: '#0B6E8A',
  },
  gradient: {
    goldButton: v('#FBDB9D', '#EEB444'),
    goldButtonHover: v('#EEB444', '#C38409'),
    tealButton: v('#7AD1BE', '#2EB899'),
    tealButtonHover: v('#54C5AC', '#248F77'),
    disabledButton: v('#F2F3F4', '#D1D3D6'),
    goldPanel: v('#FCF5E8', '#FDF1DD'),
    goldCard: v('#FFFFFF', '#FDF1DD'),
    goldSelected: v('#FDF1DD', '#FBDB9D'),
    goldActive: v('#FEDA92', '#FACF7B'),
    tealPanel: 'radial-gradient(70% 280% at 50% 50%, #ECF9F6 40%, #C6ECE3 100%)',
    tealBorder: v('#248F77', '#A0DED1', 94),
    authBg: v('#FFFFFF', '#FCE8C5'),
    progress: v('#FBDB9D', '#EEB444', 90),
  },
  shadowRgb: '0, 0, 0',
  themeColor: '#FEFBF6',
};

const DARK_STATUS = { success: '#6CCB7A', warning: '#FFA366', error: '#FF7A7C', info: '#7AD1BE' };

export const DARK_TOKENS: ColorTokens = {
  bgDefault: BRAND.black,
  bgPaper: '#1A1D21',
  bgSubtle: '#23272C',
  sidebarBg: '#16191C',
  appBarBg: '#16191C',
  borderLight: '#2E3338',
  borderStrong: '#3D434A',
  tableHeader: '#2B2418',
  searchBg: '#1A2B27',
  searchBorder: '#2E7D6B',

  textPrimary: '#F2F3F4',
  textSecondary: '#A9AEB6',
  textDisabled: '#7A808A',

  primary: BRAND.gold,
  primaryLight: '#3A3020',
  primaryDark: '#DD9E22',
  primaryBorder: '#C38409',
  primaryText: '#F5C96B',
  primaryContrast: BRAND.black,
  secondary: BRAND.teal,
  secondaryLight: '#1C3A33',
  secondaryDark: '#2EB899',
  secondaryBorder: '#248F77',
  secondaryText: '#7AD1BE',
  secondaryContrast: BRAND.black,
  streak: '#FF9A52',

  ...DARK_STATUS,
  statusContrast: BRAND.black,
  statusBg: { success: '#1B2B1E', warning: '#33241A', error: '#331C1D', info: '#18302B' },
  focusRing: '#F5C96B',

  codeBg: '#23272C',
  codeBlockBg: '#0D0F11',
  codeBlockText: '#E3E5E8',

  difficulty: { easy: DARK_STATUS.success, medium: DARK_STATUS.warning, hard: DARK_STATUS.error },
  format: {
    javascript: '#F5C96B',
    'user-interface': '#7FB2F0',
    algorithms: '#F08DB8',
    quiz: '#7AD1BE',
    'system-design': '#B3A6F0',
    behavioral: '#6CC6E0',
  },
  gradient: {
    goldButton: v('#FBDB9D', '#EEB444'),
    goldButtonHover: v('#EEB444', '#DD9E22'),
    tealButton: v('#7AD1BE', '#2EB899'),
    tealButtonHover: v('#54C5AC', '#2EB899'),
    disabledButton: v('#2E3338', '#23272C'),
    goldPanel: v('#2E2518', '#2A2315'),
    goldCard: v('#23272C', '#2A2315'),
    goldSelected: v('#3A3020', '#4A3A1C'),
    goldActive: v('#3F3220', '#4A3A1C'),
    tealPanel: 'radial-gradient(70% 280% at 50% 50%, #18302B 40%, #1C3A33 100%)',
    tealBorder: v('#248F77', '#2E7D6B', 94),
    authBg: v('#121416', '#3A2E1A'),
    progress: v('#FBDB9D', '#EEB444', 90),
  },
  shadowRgb: '0, 0, 0',
  themeColor: '#16191C',
};

export const getTokens = (mode: ThemeMode): ColorTokens =>
  mode === 'light' ? LIGHT_TOKENS : DARK_TOKENS;
