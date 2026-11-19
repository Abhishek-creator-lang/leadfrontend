'use client';

import { ReactNode, useContext, useState } from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppBar,
  Autocomplete,
  Box,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CenterFocusStrongRoundedIcon from '@mui/icons-material/CenterFocusStrongRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import { APP_NAME } from '@/constants/app';
import { APP_BAR_HEIGHT, DRAWER_WIDTH } from '@/constants/layout';
import { MAIN_NAV, NavKey, PAGE_TITLES } from '@/constants/navigation';
import { content, FORMAT_COUNTS } from '@/content';
import { FORMAT_INFO, FORMAT_ORDER } from '@/content/formats';
import type { QuestionMeta } from '@/content/types';
import { ThemeModeContext } from '@/context/ThemeModeContext';
import { useModeColors } from '@/hooks/useModeColors';
import { PATHS, formatPath, isQuestionWorkspacePath, questionPath } from '@/routes/paths';

const NAV_ICONS: Partial<Record<NavKey, ReactNode>> = {
  dashboard: <DashboardRoundedIcon />,
  questions: <ListAltRoundedIcon />,
  studyPlans: <CalendarMonthRoundedIcon />,
  focusAreas: <CenterFocusStrongRoundedIcon />,
  guides: <MenuBookRoundedIcon />,
  companies: <BusinessRoundedIcon />,
  bookmarks: <BookmarkRoundedIcon />,
  settings: <SettingsRoundedIcon />,
};

/** Mirrors React Router's NavLink matching: exact when `end`, otherwise the path or any sub-path. */
const isActive = (pathname: string, to: string, end?: boolean) =>
  end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

function NavItem({
  to,
  label,
  icon,
  end,
  badge,
  onNavigate,
}: {
  to: string;
  label: string;
  icon?: ReactNode;
  end?: boolean;
  badge?: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? '';
  const active = isActive(pathname, to, end);
  return (
    <ListItemButton
      component={NextLink}
      href={to}
      className={active ? 'active' : undefined}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
      sx={{ mb: 0.25, py: 0.75 }}
    >
      {icon && <ListItemIcon sx={{ minWidth: 34 }}>{icon}</ListItemIcon>}
      <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
      {badge !== undefined && (
        <Typography variant="caption" color="text.secondary">
          {badge}
        </Typography>
      )}
    </ListItemButton>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Box sx={{ px: 1.5, py: 1, overflowY: 'auto', flex: 1 }}>
      <List dense disablePadding>
        {MAIN_NAV.map((n) => (
          <NavItem
            key={n.id}
            to={n.to}
            label={n.label}
            end={n.end}
            icon={NAV_ICONS[n.id]}
            onNavigate={onNavigate}
          />
        ))}
      </List>
      <Divider sx={{ my: 1.5 }} />
      <List
        dense
        disablePadding
        subheader={
          <ListSubheader
            disableSticky
            sx={{
              bgcolor: 'transparent',
              lineHeight: '32px',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Question formats
          </ListSubheader>
        }
      >
        {FORMAT_ORDER.map((f) => (
          <NavItem
            key={f}
            to={formatPath(f)}
            label={FORMAT_INFO[f].short}
            icon={
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: FORMAT_INFO[f].color,
                  ml: 0.75,
                }}
              />
            }
            badge={FORMAT_COUNTS[f]}
            onNavigate={onNavigate}
          />
        ))}
      </List>
      <Divider sx={{ my: 1.5 }} />
      <List dense disablePadding>
        <NavItem
          to={PATHS.settings}
          label={PAGE_TITLES.settings}
          icon={NAV_ICONS.settings}
          onNavigate={onNavigate}
        />
      </List>
    </Box>
  );
}

function GlobalSearch() {
  const router = useRouter();
  const [value, setValue] = useState<QuestionMeta | null>(null);
  return (
    <Autocomplete
      size="small"
      value={value}
      options={content.questions}
      getOptionLabel={(q) => q.title}
      groupBy={(q) => FORMAT_INFO[q.format].label}
      onChange={(_, q) => {
        if (q) router.push(questionPath(q));
        setValue(null);
      }}
      blurOnSelect
      sx={{ width: { xs: '100%', sm: 360 } }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search questions…"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  );
}

function Brand() {
  return (
    <Box
      component={NextLink}
      href={PATHS.dashboard}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: 'inherit',
        textDecoration: 'none',
      }}
    >
      <Box component="img" src="/favicon.svg" alt="" sx={{ width: 28, height: 28 }} />
      <Typography fontWeight={800} letterSpacing="-0.02em">
        {APP_NAME}
      </Typography>
    </Box>
  );
}

/** App bar + sidebar. The sidebar is permanent on desktop, except inside the question workspace. */
export function AppShell({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const mc = useModeColors();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [open, setOpen] = useState(false);
  const { mode, toggleTheme } = useContext(ThemeModeContext);
  const pathname = usePathname() ?? '';
  const permanent = isDesktop && !isQuestionWorkspacePath(pathname);
  const appBarOffset = `${APP_BAR_HEIGHT}px`;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: mc.sidebarBg,
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: { xs: APP_BAR_HEIGHT } }} variant="dense">
          {!permanent && (
            <IconButton edge="start" onClick={() => setOpen(true)} aria-label="Open navigation">
              <MenuRoundedIcon />
            </IconButton>
          )}
          <Box
            sx={{
              width: permanent ? DRAWER_WIDTH - 24 : 'auto',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            <Brand />
          </Box>
          <GlobalSearch />
          <Box sx={{ flex: 1 }} />
          <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={toggleTheme} aria-label="Toggle color mode">
              {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {permanent ? (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              bgcolor: mc.sidebarBg,
              pt: appBarOffset,
              display: 'flex',
            },
          }}
        >
          <SidebarContent />
        </Drawer>
      ) : (
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          sx={{
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: mc.sidebarBg, display: 'flex' },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Brand />
          </Box>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </Drawer>
      )}

      <Box component="main" sx={{ flex: 1, minWidth: 0, pt: appBarOffset }}>
        {children}
      </Box>
    </Box>
  );
}
