import { TypographyOptions } from '@mui/material/styles/createTypography';
import { RESPONSIVE_FONT_SIZES, FONT_WEIGHTS } from '../constants/fontSizes';

const pxToRem = (px: number): string => `${px / 16}rem`;

const typography: TypographyOptions = {
  fontFamily: 'var(--font-inter), "Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
  htmlFontSize: 16,
  fontSize: 14,
  fontWeightLight: FONT_WEIGHTS.light,
  fontWeightRegular: FONT_WEIGHTS.regular,
  fontWeightMedium: FONT_WEIGHTS.medium,
  fontWeightBold: FONT_WEIGHTS.bold,

  h1: {
    fontSize: pxToRem(RESPONSIVE_FONT_SIZES.h1.lg),
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: pxToRem(RESPONSIVE_FONT_SIZES.h2.lg),
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: pxToRem(RESPONSIVE_FONT_SIZES.h3.lg),
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: pxToRem(RESPONSIVE_FONT_SIZES.h4.lg),
    fontWeight: FONT_WEIGHTS.extrabold,
    lineHeight: 1.4,
    letterSpacing: '-0.02em',
  },
  h5: {
    fontSize: pxToRem(RESPONSIVE_FONT_SIZES.h5.lg),
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: pxToRem(RESPONSIVE_FONT_SIZES.h6.lg),
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 1.5,
  },
  subtitle1: {
    fontSize: pxToRem(RESPONSIVE_FONT_SIZES.subtitle1.lg),
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 1.57,
  },
  subtitle2: {
    fontSize: pxToRem(RESPONSIVE_FONT_SIZES.subtitle2.lg),
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 1.57,
  },
  body1: {
    fontSize: pxToRem(RESPONSIVE_FONT_SIZES.body1.lg),
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 1.6,
  },
  body2: {
    fontSize: pxToRem(RESPONSIVE_FONT_SIZES.body2.lg),
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 1.57,
  },
  caption: {
    fontSize: pxToRem(RESPONSIVE_FONT_SIZES.caption.lg),
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 1.66,
  },
  overline: {
    fontSize: pxToRem(RESPONSIVE_FONT_SIZES.overline.lg),
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 2.66,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  button: {
    fontSize: pxToRem(14),
    fontWeight: FONT_WEIGHTS.semibold,
    textTransform: 'none',
    letterSpacing: '0.01em',
  },
};

export default typography;
