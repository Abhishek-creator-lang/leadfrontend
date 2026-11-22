import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import { Page } from '@/layout/Page';
import { requireAdmin } from '@/server/auth/dal';
import { AdminNav } from '@/views/admin/AdminNav';

export const metadata: Metadata = { title: { default: 'Admin', template: '%s · Admin' } };

/** Every /admin page requires an admin or super admin (learners get "forbidden", guests the login). */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return (
    <Page maxWidth={CONTENT_MAX_WIDTH.default}>
      <AdminNav />
      {children}
    </Page>
  );
}
