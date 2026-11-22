import type { Metadata } from 'next';
import { LICENSES_MD } from '@/content/legal/licenses';
import { pageMetadata } from '@/lib/seo';
import { PATHS } from '@/routes/paths';
import { LegalPage } from '@/views/legal/LegalPage';

export const metadata: Metadata = pageMetadata({
  title: 'Licenses & Credits',
  description:
    'Open-source content and software used by Lead Frontend, with their license notices.',
  path: PATHS.licenses,
});

export default function Page() {
  return <LegalPage title="Licenses & Credits" md={LICENSES_MD} />;
}
