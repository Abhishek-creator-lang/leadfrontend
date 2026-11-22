import type { Metadata } from 'next';
import { Card } from '@mui/material';
import { EmptyState } from '@/components/EmptyState';
import { SupportPanel } from '@/components/support/SupportPanel';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import { isSupportActive } from '@/lib/validation/support';
import { Page, PageHeader } from '@/layout/Page';
import { getSupportSettings } from '@/server/support';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getSupportSettings()).heading };
}

export default async function SupportPage() {
  const settings = await getSupportSettings();
  if (!isSupportActive(settings)) {
    return (
      <EmptyState
        title="Support is not available right now"
        description="Thanks for thinking of it!"
      />
    );
  }
  return (
    <Page maxWidth={CONTENT_MAX_WIDTH.form}>
      <PageHeader title={`${settings.heading} ☕`} />
      <Card sx={{ p: { xs: 3, sm: 4 }, maxWidth: 480, mx: 'auto' }}>
        <SupportPanel settings={settings} />
      </Card>
    </Page>
  );
}
