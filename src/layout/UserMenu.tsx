'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import { logoutAction } from '@/app/(auth)/actions';
import { isAdminRole, ROLE_LABEL } from '@/constants/roles';
import { useCurrentUser } from '@/context/SessionContext';
import { isAuthPath, loginPath, PATHS } from '@/routes/paths';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');

/** App bar account area: "Log in / Sign up" for guests, an avatar menu for signed-in users. */
export function UserMenu() {
  const user = useCurrentUser();
  const pathname = usePathname() ?? '';
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const close = () => setAnchor(null);

  if (!user) {
    // Come back to the current page after signing in (but not to another auth page).
    const next = isAuthPath(pathname) ? undefined : pathname;
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button component={NextLink} href={loginPath(next)} color="inherit">
          Log in
        </Button>
        <Button
          component={NextLink}
          href={PATHS.register}
          variant="contained"
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          Sign up
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Tooltip title="Account">
        <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Open account menu">
          <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'primary.main' }}>
            {initials(user.name) || '?'}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 240 } } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography fontWeight={700} noWrap>
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user.email}
          </Typography>
          <Chip size="small" label={ROLE_LABEL[user.role]} sx={{ mt: 1 }} />
        </Box>
        <Divider />
        <MenuItem component={NextLink} href={PATHS.account} onClick={close}>
          <ListItemIcon>
            <ManageAccountsRoundedIcon fontSize="small" />
          </ListItemIcon>
          Account
        </MenuItem>
        {isAdminRole(user.role) && (
          <MenuItem component={NextLink} href={PATHS.admin} onClick={close}>
            <ListItemIcon>
              <AdminPanelSettingsRoundedIcon fontSize="small" />
            </ListItemIcon>
            Admin
          </MenuItem>
        )}
        <Divider />
        <form action={logoutAction}>
          <MenuItem component="button" type="submit" sx={{ width: '100%' }}>
            <ListItemIcon>
              <LogoutRoundedIcon fontSize="small" />
            </ListItemIcon>
            Log out
          </MenuItem>
        </form>
      </Menu>
    </>
  );
}
