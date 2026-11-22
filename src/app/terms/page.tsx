import type { Metadata } from 'next';
import { TERMS_MD } from '@/content/legal/terms';
import { pageMetadata } from '@/lib/seo';
import { PATHS } from '@/routes/paths';
import { LegalPage } from '@/views/legal/LegalPage';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Use',
  description:
    'The rules for using Lead Frontend: free educational content provided as is, acceptable use, intellectual property, liability and governing law.',
  path: PATHS.terms,
});

export default function Page() {
  return <LegalPage title="Terms of Use" md={TERMS_MD} />;
}
