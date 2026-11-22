import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { APP_DESCRIPTION, APP_TITLE } from '@/constants/app';
import { HOME_FAQ } from '@/content/homeFaq';
import { faqLd, pageMetadata } from '@/lib/seo';
import { PATHS } from '@/routes/paths';
import { getCurrentUser } from '@/server/auth/dal';
import HomePage from '@/views/home/HomePage';

export const metadata: Metadata = {
  ...pageMetadata({ title: APP_TITLE, description: APP_DESCRIPTION, path: PATHS.home }),
  // The full title already carries the brand; skip the "%s | Lead Frontend" template.
  title: { absolute: APP_TITLE },
};

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <>
      <JsonLd data={faqLd(HOME_FAQ)} />
      <HomePage signedIn={!!user} />
    </>
  );
}
