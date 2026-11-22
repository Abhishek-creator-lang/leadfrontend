import type { Metadata } from 'next';
import { DISCLAIMER_MD } from '@/content/legal/disclaimer';
import { pageMetadata } from '@/lib/seo';
import { PATHS } from '@/routes/paths';
import { LegalPage } from '@/views/legal/LegalPage';

export const metadata: Metadata = pageMetadata({
  title: 'Disclaimer',
  description:
    'Lead Frontend content is educational, provided as is and may contain errors. Not affiliated with any company or product named on the site.',
  path: PATHS.disclaimer,
});

export default function Page() {
  return <LegalPage title="Disclaimer" md={DISCLAIMER_MD} />;
}
