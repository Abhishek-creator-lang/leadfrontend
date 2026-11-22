import type { Metadata } from 'next';
import { COPYRIGHT_MD } from '@/content/legal/copyright';
import { pageMetadata } from '@/lib/seo';
import { PATHS } from '@/routes/paths';
import { LegalPage } from '@/views/legal/LegalPage';

export const metadata: Metadata = pageMetadata({
  title: 'Copyright & Content Complaints',
  description:
    'How to report content you believe infringes your rights, and how Lead Frontend responds.',
  path: PATHS.copyright,
});

export default function Page() {
  return <LegalPage title="Copyright & Content Complaints" md={COPYRIGHT_MD} />;
}
