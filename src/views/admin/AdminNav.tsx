'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { Tab, Tabs } from '@mui/material';
import { useCurrentUser } from '@/context/SessionContext';
import { PATHS } from '@/routes/paths';

const TABS = [
  { href: PATHS.admin, label: 'Overview' },
  { href: PATHS.adminContent, label: 'Content' },
  { href: PATHS.adminUsers, label: 'Users' },
  { href: PATHS.adminSupport, label: 'Buy me a coffee', superAdminOnly: true },
];

export function AdminNav() {
  const pathname = usePathname() ?? '';
  const isSuperAdmin = useCurrentUser()?.role === 'super_admin';
  const tabs = TABS.filter((t) => !t.superAdminOnly || isSuperAdmin);
  // The most specific tab whose path prefixes the current URL.
  const current =
    [...tabs].reverse().find((t) => pathname === t.href || pathname.startsWith(`${t.href}/`))
      ?.href ?? false;
  return (
    <Tabs value={current} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
      {tabs.map((t) => (
        <Tab key={t.href} value={t.href} label={t.label} component={NextLink} href={t.href} />
      ))}
    </Tabs>
  );
}
