'use client';

import { ReactNode, useContext, useEffect, useRef, useState } from 'react';
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
  Stack,
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
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import { APP_NAME } from '@/constants/app';
import { APP_BAR_HEIGHT, DRAWER_WIDTH } from '@/constants/layout';
import { MAIN_NAV, NavKey, PAGE_TITLES } from '@/constants/navigation';
import { useContent } from '@/context/ContentContext';
import { FORMAT_INFO, FORMAT_ORDER } from '@/content/formats';
import type { QuestionSummary } from '@/content/types';
import { isAdminRole } from '@/constants/roles';
import { useCurrentUser } from '@/context/SessionContext';
import { ThemeModeContext } from '@/context/ThemeModeContext';
import { useModeColors } from '@/hooks/useModeColors';
import { getTokens } from '@/theme/tokens';
import {
  PATHS,
  formatPath,
  isAuthPath,
  isQuestionWorkspacePath,
  questionPath,
} from '@/routes/paths';
import { UserMenu } from './UserMenu';
import { Footer, LEGAL_LINKS } from './Footer';
import { NavigationProgress, startNavigationProgress } from './NavigationProgress';
import { LogoMark } from '@/components/LogoMark';
import { FONT_HEADING } from '@/theme/fonts';
import { SupportButton } from '@/components/support/SupportButton';
import { useSupportSettings } from '@/context/SupportContext';
import LocalCafeRoundedIcon from '@mui/icons-material/LocalCafeRounded';

const NAV_ICONS: Partial<Record<NavKey, ReactNode>> = {
  dashboard: <DashboardRoundedIcon />,
  questions: <ListAltRoundedIcon />,
  studyPlans: <CalendarMonthRoundedIcon />,
  focusAreas: <CenterFocusStrongRoundedIcon />,
  guides: <MenuBookRoundedIcon />,
  mockInterview: <TimerRoundedIcon />,
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
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {badge}
        </Typography>
      )}
    </ListItemButton>
  );
}

function SectionHeader({ children }: { children: ReactNode }) {
  return (
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
      {children}
    </ListSubheader>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { FORMAT_COUNTS } = useContent();
  const isAdmin = isAdminRole(useCurrentUser()?.role);
  const support = useSupportSettings();
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
      <List dense disablePadding subheader={<SectionHeader>Question formats</SectionHeader>}>
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
                  bgcolor: `format.${f}`,
                  ml: 0.75,
                }}
              />
            }
            badge={FORMAT_COUNTS[f]}
            onNavigate={onNavigate}
          />
        ))}
      </List>
      {isAdmin && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <List dense disablePadding subheader={<SectionHeader>Admin</SectionHeader>}>
            <NavItem
              to={PATHS.admin}
              label="Overview"
              icon={<AdminPanelSettingsRoundedIcon />}
              end
              onNavigate={onNavigate}
            />
            <NavItem
              to={PATHS.adminContent}
              label="Content"
              icon={<ArticleRoundedIcon />}
              onNavigate={onNavigate}
            />
            <NavItem
              to={PATHS.adminUsers}
              label="Users"
              icon={<GroupRoundedIcon />}
              onNavigate={onNavigate}
            />
          </List>
        </>
      )}
      <Divider sx={{ my: 1.5 }} />
      <List dense disablePadding>
        {support?.showInSidebar && (
          <NavItem
            to={PATHS.support}
            label={support.heading}
            icon={<LocalCafeRoundedIcon />}
            onNavigate={onNavigate}
          />
        )}
        <NavItem
          to={PATHS.settings}
          label={PAGE_TITLES.settings}
          icon={NAV_ICONS.settings}
          onNavigate={onNavigate}
        />
      </List>
      <Stack
        direction="row"
        flexWrap="wrap"
        useFlexGap
        columnGap={1.5}
        rowGap={0.5}
        sx={{ px: 2, pt: 2, pb: 1 }}
      >
        {LEGAL_LINKS.slice(0, 3).map((l) => (
          <Box
            key={l.href}
            component={NextLink}
            href={l.href}
            onClick={onNavigate}
            sx={{
              fontSize: 12,
              color: 'text.secondary',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {l.label}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function GlobalSearch() {
  const { content } = useContent();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const [value, setValue] = useState<QuestionSummary | null>(null);
  return (
    <Autocomplete
      size="small"
      value={value}
      options={content.questions}
      getOptionLabel={(q) => q.title}
      groupBy={(q) => FORMAT_INFO[q.format].label}
      onChange={(_, q) => {
        if (q) {
          const href = questionPath(q);
          startNavigationProgress(href);
          router.push(href);
        }
        setValue(null);
      }}
      blurOnSelect
      popupIcon={null}
      sx={{ width: { xs: '100%', sm: 360 } }}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={inputRef}
          placeholder="Search questions…"
          // Teal search field, as in the reference header.
          sx={(t) => {
            const c = getTokens(t.palette.mode);
            return {
              '& .MuiOutlinedInput-root': {
                bgcolor: c.searchBg,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: c.searchBorder },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.secondaryBorder },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: c.secondaryBorder,
                },
              },
            };
          }}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
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
      href={PATHS.home}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: 'inherit',
        textDecoration: 'none',
      }}
    >
      <LogoMark size={28} />
      <Typography component="span" fontFamily={FONT_HEADING} fontWeight={700} fontSize={17} noWrap>
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
  const permanent = isDesktop && !isQuestionWorkspacePath(pathname) && !isAuthPath(pathname);
  const appBarOffset = `${APP_BAR_HEIGHT}px`;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <NavigationProgress />
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: mc.appBarBg,
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
          <SupportButton />
          <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={toggleTheme} aria-label="Toggle color mode">
              {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
            </IconButton>
          </Tooltip>
          <UserMenu />
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

      <Box
        component="main"
        sx={{ flex: 1, minWidth: 0, pt: appBarOffset, display: 'flex', flexDirection: 'column' }}
      >
        <Box sx={{ flex: 1 }}>{children}</Box>
        {/* The question workspace is full height, so it shows the links in the sidebar instead. */}
        {!isQuestionWorkspacePath(pathname) && <Footer />}
      </Box>
    </Box>
  );
}
