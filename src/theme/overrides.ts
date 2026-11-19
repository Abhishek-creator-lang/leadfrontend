import { Theme, Components } from '@mui/material/styles';
import { getModeColors } from '../constants/colors';

const overrides = (theme: Theme): Components<Theme> => {
  const mc = getModeColors(theme.palette.mode);
  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: mc.bgDefault },
        'code:not(pre code)': {
          fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '0.875em',
          background: mc.codeBg,
          padding: '1px 6px',
          borderRadius: 4,
        },
        '*::-webkit-scrollbar': { width: 8, height: 8 },
        '*::-webkit-scrollbar-thumb': { background: mc.borderLight, borderRadius: 8 },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 } },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: { root: { borderRadius: 12, borderColor: mc.borderLight } },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 6, fontWeight: 500 } } },
    MuiTextField: { defaultProps: { variant: 'outlined', size: 'small' } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 44 } } },
    MuiTabs: { styleOverrides: { root: { minHeight: 44 } } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 4, height: 6 } } },
    MuiTooltip: { defaultProps: { arrow: true } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 12 } } },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: theme.palette.mode === 'light' ? '#EEF2FF' : 'rgba(99,102,241,0.16)',
            color: theme.palette.primary.main,
            '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
          },
        },
      },
    },
    MuiTableCell: { styleOverrides: { root: { borderBottom: `1px solid ${mc.borderLight}` } } },
  };
};

export default overrides;
