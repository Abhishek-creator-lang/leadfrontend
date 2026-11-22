import type { Metadata } from 'next';
import { PRIVACY_MD } from '@/content/legal/privacy';
import { pageMetadata } from '@/lib/seo';
import { PATHS } from '@/routes/paths';
import { LegalPage } from '@/views/legal/LegalPage';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    "What personal data Lead Frontend collects, why, who processes it and how to exercise your rights under India's DPDP Act 2023.",
  path: PATHS.privacy,
});

export default function Page() {
  return <LegalPage title="Privacy Policy" md={PRIVACY_MD} />;
}
