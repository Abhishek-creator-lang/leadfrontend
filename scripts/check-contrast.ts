/**
 * WCAG 2.1 contrast check for the theme tokens (src/theme/tokens.ts).
 * Text must reach 4.5:1 (AA), large text / UI parts 3:1. Exits 1 if any pair fails.
 *
 *   npm run check:contrast
 */
import { DARK_TOKENS, LIGHT_TOKENS, type ColorTokens } from '../src/theme/tokens';

const hex = (h: string) => {
  const n = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
};

const luminance = (h: string) => {
  const [r, g, b] = hex(h).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** `fg` at `alpha` over `bg`, as an opaque hex (how MUI tinted chips render). */
const blend = (fg: string, bg: string, alpha: number) => {
  const f = hex(fg);
  const b = hex(bg);
  return `#${f
    .map((c, i) => Math.round(c * alpha + b[i] * (1 - alpha)))
    .map((c) => c.toString(16).padStart(2, '0'))
    .join('')}`;
};

type Pair = [label: string, fg: string, bg: string, min: number];

function pairs(t: ColorTokens): Pair[] {
  const TEXT = 4.5;
  const UI = 3;
  const surfaces: [string, string][] = [
    ['default', t.bgDefault],
    ['paper', t.bgPaper],
    ['subtle', t.bgSubtle],
    ['sidebar', t.sidebarBg],
  ];
  const out: Pair[] = [];
  for (const [name, bg] of surfaces) {
    out.push([`text.primary on ${name}`, t.textPrimary, bg, TEXT]);
    out.push([`text.secondary on ${name}`, t.textSecondary, bg, TEXT]);
    out.push([`text.disabled on ${name}`, t.textDisabled, bg, UI]);
  }
  // Gold and teal are fills with black text; gold/teal-family text uses the *Text shades.
  out.push(['primary button text', t.primaryContrast, t.primary, TEXT]);
  out.push(['primary button hover text', t.primaryContrast, t.primaryDark, TEXT]);
  out.push(['secondary button text', t.secondaryContrast, t.secondary, TEXT]);
  out.push(['secondary button hover text', t.secondaryContrast, t.secondaryDark, TEXT]);
  out.push(['selected nav text', t.textPrimary, t.primaryLight, TEXT]);
  out.push(['table header text', t.textPrimary, t.tableHeader, TEXT]);
  out.push(['outlined button border on paper', t.primaryBorder, t.bgPaper, UI]);
  for (const [name, bg] of surfaces) {
    out.push([`primaryText on ${name}`, t.primaryText, bg, TEXT]);
    out.push([`secondaryText on ${name}`, t.secondaryText, bg, TEXT]);
    out.push([`focus ring on ${name}`, t.focusRing, bg, UI]);
  }
  // Gradients: check every stop.
  const stops = (g: string) => g.match(/#[0-9A-Fa-f]{6}/g) ?? [];
  for (const k of ['goldButton', 'goldButtonHover', 'tealButton', 'tealButtonHover'] as const) {
    for (const c of stops(t.gradient[k]))
      out.push([`button text on ${k} stop`, t.primaryContrast, c, TEXT]);
  }
  for (const c of stops(t.gradient.disabledButton))
    out.push(['disabled button text', t.textSecondary, c, UI]);
  for (const k of [
    'goldPanel',
    'goldCard',
    'goldSelected',
    'goldActive',
    'tealPanel',
    'authBg',
  ] as const) {
    for (const c of stops(t.gradient[k])) {
      out.push([`text.primary on ${k} stop`, t.textPrimary, c, TEXT]);
      // Active toggles only carry text.primary labels.
      if (k !== 'goldActive') out.push([`text.secondary on ${k} stop`, t.textSecondary, c, TEXT]);
    }
  }
  out.push(['text on search field', t.textPrimary, t.searchBg, TEXT]);
  out.push(['placeholder on search field', t.textSecondary, t.searchBg, TEXT]);
  out.push(['code block text', t.codeBlockText, t.codeBlockBg, TEXT]);
  out.push(['inline code text', t.textPrimary, t.codeBg, TEXT]);
  for (const k of ['success', 'warning', 'error', 'info'] as const) {
    out.push([`${k} alert text`, t[k], t.statusBg[k], TEXT]);
  }
  for (const k of ['success', 'warning', 'error', 'info'] as const) {
    out.push([`${k} text on paper`, t[k], t.bgPaper, TEXT]);
    out.push([`text on filled ${k}`, t.statusContrast, t[k], TEXT]);
  }
  for (const [k, c] of Object.entries({ ...t.format, ...t.difficulty })) {
    out.push([`${k} text on paper`, c, t.bgPaper, TEXT]);
    out.push([`${k} chip (text on 10% tint)`, c, blend(c, t.bgPaper, 0.1), TEXT]);
  }
  return out;
}

let failed = 0;
for (const [mode, tokens] of [
  ['light', LIGHT_TOKENS],
  ['dark', DARK_TOKENS],
] as const) {
  console.log(`\n${mode.toUpperCase()}`);
  for (const [label, fg, bg, min] of pairs(tokens)) {
    const ratio = contrast(fg, bg);
    const ok = ratio >= min;
    if (!ok) failed++;
    console.log(
      `${ok ? '  ok ' : 'FAIL '} ${ratio.toFixed(2).padStart(5)}:1 (≥${min})  ${label}  ${fg} on ${bg}`
    );
  }
}
console.log(failed ? `\n${failed} pair(s) below WCAG AA` : '\nAll pairs meet WCAG AA');
process.exit(failed ? 1 : 0);
