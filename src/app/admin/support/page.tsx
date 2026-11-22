import type { Metadata } from 'next';
import { PageHeader } from '@/layout/Page';
import { PATHS } from '@/routes/paths';
import { requireSuperAdmin } from '@/server/auth/dal';
import { readSupportSettings } from '@/server/support';
import { SupportSettingsForm } from '@/views/admin/SupportSettingsForm';

export const metadata: Metadata = { title: 'Buy me a coffee' };

export default async function AdminSupportPage() {
  await requireSuperAdmin(PATHS.adminSupport);
  // Read fresh (not the cached copy) so the form always shows what is stored.
  const settings = await readSupportSettings();
  return (
    <>
      <PageHeader
        title="Buy me a coffee"
        subtitle="Let visitors support the site with a UPI payment. All content stays free."
      />
      <SupportSettingsForm initial={settings} />
    </>
  );
}
