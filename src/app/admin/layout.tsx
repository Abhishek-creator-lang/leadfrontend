import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import { Page } from '@/layout/Page';
import { requireAdmin } from '@/server/auth/dal';
import { AdminNav } from '@/views/admin/AdminNav';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin' },
  robots: { index: false, follow: false },
};

/**
 * Admin chrome. The check here keeps the nav hidden from non-admins, but it does NOT protect pages:
 * Next.js renders a layout and its page in parallel, so every admin page must call requireAdmin()
 * (or requireSuperAdmin()) itself.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return (
    <Page maxWidth={CONTENT_MAX_WIDTH.default}>
      <AdminNav />
      {children}
    </Page>
  );
}
