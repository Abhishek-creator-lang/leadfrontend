import { alpha, Components, Theme } from '@mui/material/styles';
import { getTokens } from './tokens';
import { FONT_MONO } from './fonts';

/**
 * Component-level design system on top of the palette (see src/theme/tokens.ts).
 * Flat and quiet: 4px controls, 8px cards, thin borders, no shadows on buttons or cards.
 */
const overrides = (theme: Theme): Components<Theme> => {
  const t = getTokens(theme.palette.mode);
  const light = theme.palette.mode === 'light';
  const g = t.gradient;
  const focusRing = { outline: `2px solid ${t.focusRing}`, outlineOffset: 2 };
  const disabled = light
    ? { backgroundColor: t.borderStrong, color: t.textSecondary }
    : { backgroundColor: t.bgSubtle, color: t.textDisabled };

  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: t.bgDefault,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '::selection': { backgroundColor: alpha(t.primary, 0.35), color: t.textPrimary },
        'code:not(pre code)': {
          fontFamily: FONT_MONO,
          fontSize: '0.85em',
          background: t.codeBg,
          color: t.textPrimary,
          padding: '1px 5px',
          borderRadius: 4,
        },
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '*::-webkit-scrollbar-thumb': {
          background: t.borderStrong,
          borderRadius: 10,
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
        },
      },
    },

    MuiButtonBase: {
      styleOverrides: { root: { '&.Mui-focusVisible': focusRing } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 4,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
          '& .MuiButton-startIcon': { marginRight: 6 },
          '& .MuiButton-endIcon': { marginLeft: 6 },
        },
        sizeSmall: { padding: '6px 12px', fontSize: 12, lineHeight: '16px' },
        sizeMedium: { padding: '8px 16px', fontSize: 14, lineHeight: '20px' },
        sizeLarge: { padding: '10px 20px', fontSize: 15, lineHeight: '22px' },
        // Soft vertical gold / teal gradients (reference: containedPrimaryGradient).
        containedPrimary: {
          color: t.primaryContrast,
          backgroundImage: g.goldButton,
          '&:hover': { backgroundImage: g.goldButtonHover },
        },
        containedSecondary: {
          color: t.secondaryContrast,
          backgroundImage: g.tealButton,
          '&:hover': { backgroundImage: g.tealButtonHover },
        },
        contained: { '&.Mui-disabled': { ...disabled, backgroundImage: g.disabledButton } },
        outlined: {
          padding: '7px 15px',
          '&.MuiButton-sizeSmall': { padding: '5px 11px' },
          '&.MuiButton-sizeLarge': { padding: '9px 19px' },
        },
        outlinedPrimary: {
          color: t.primaryText,
          borderColor: t.primaryBorder,
          '&:hover': { borderColor: t.primaryBorder, backgroundColor: t.primaryLight },
        },
        outlinedSecondary: {
          color: t.secondaryText,
          borderColor: t.secondaryBorder,
          '&:hover': { borderColor: t.secondaryBorder, backgroundColor: t.secondaryLight },
        },
        outlinedInherit: { borderColor: t.borderStrong },
        textPrimary: {
          color: t.primaryText,
          '&:hover': { backgroundColor: t.primaryLight },
        },
        textSecondary: { color: t.secondaryText },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: 4 },
        colorPrimary: { color: t.primaryText },
      },
    },
    MuiLink: {
      defaultProps: { underline: 'hover' },
      styleOverrides: { root: { color: t.primaryText, fontWeight: 500 } },
    },

    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        rounded: { borderRadius: 8 },
      },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          borderRadius: 8,
          borderColor: t.borderLight,
          boxShadow: 'none',
          transition: 'border-color 120ms ease',
          '&:has(> .MuiCardActionArea-root):hover': { borderColor: t.borderStrong },
        },
      },
    },
    MuiCardActionArea: {
      styleOverrides: {
        root: { '&:hover .MuiCardActionArea-focusHighlight': { opacity: light ? 0.02 : 0.04 } },
      },
    },

    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundColor: t.appBarBg, backgroundImage: 'none' } },
    },
    MuiDrawer: {
      styleOverrides: { paper: { borderColor: t.borderLight } },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 4, fontWeight: 500 },
        outlined: { borderColor: t.borderStrong },
        outlinedPrimary: { color: t.primaryText, borderColor: t.primaryBorder },
        outlinedSecondary: { color: t.secondaryText, borderColor: t.secondaryBorder },
        filledPrimary: { backgroundImage: g.goldButton, color: t.primaryContrast },
      },
    },

    MuiTextField: { defaultProps: { variant: 'outlined', size: 'small' } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: t.bgPaper,
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: t.textDisabled },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: t.primaryBorder,
            borderWidth: 1,
          },
        },
        notchedOutline: { borderColor: t.borderStrong },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { '&.Mui-focused': { color: t.primaryText } } },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          border: `1px solid ${t.borderLight}`,
          boxShadow: theme.shadows[4],
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          border: `1px solid ${t.borderLight}`,
          boxShadow: theme.shadows[4],
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: { height: 2, backgroundColor: t.primary },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          color: t.textSecondary,
          '&.Mui-selected': { color: t.textPrimary },
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, height: 6, backgroundColor: t.bgSubtle },
        bar: { borderRadius: 4 },
        barColorPrimary: { backgroundImage: g.progress },
      },
    },

    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: {
        tooltip: {
          backgroundColor: light ? t.textPrimary : t.bgSubtle,
          borderRadius: 4,
          fontSize: 12,
        },
        arrow: { color: light ? t.textPrimary : t.bgSubtle },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 8 } },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          '&.Mui-selected, &.active': {
            backgroundColor: t.primaryLight,
            backgroundImage: g.goldSelected,
            color: t.textPrimary,
            '& .MuiListItemIcon-root': { color: t.textPrimary },
            '&:hover': { backgroundColor: t.primaryLight },
          },
        },
      },
    },
    MuiListItemIcon: { styleOverrides: { root: { color: t.textSecondary } } },

    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${t.borderLight}`, fontVariantNumeric: 'tabular-nums' },
        head: { backgroundColor: t.tableHeader, fontWeight: 600, color: t.textPrimary },
      },
    },
    MuiTableRow: {
      styleOverrides: { hover: { '&:hover': { backgroundColor: `${t.bgSubtle} !important` } } },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 4 },
        standardSuccess: { backgroundColor: t.statusBg.success, color: t.textPrimary },
        standardWarning: { backgroundColor: t.statusBg.warning, color: t.textPrimary },
        standardError: { backgroundColor: t.statusBg.error, color: t.textPrimary },
        standardInfo: { backgroundColor: t.statusBg.info, color: t.textPrimary },
      },
    },
    MuiDivider: { styleOverrides: { root: { borderColor: t.borderLight } } },
    MuiAvatar: {
      styleOverrides: {
        colorDefault: {
          backgroundColor: t.primary,
          backgroundImage: g.goldButton,
          color: t.primaryContrast,
          fontWeight: 600,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderColor: t.borderStrong,
          '&.Mui-selected': {
            backgroundColor: t.primaryLight,
            backgroundImage: g.goldActive,
            color: t.textPrimary,
            '&:hover': { backgroundColor: t.primaryLight },
          },
        },
      },
    },
  };
};

export default overrides;
