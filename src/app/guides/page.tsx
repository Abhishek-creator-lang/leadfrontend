import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { PATHS } from '@/routes/paths';
import GuidesPage from '@/views/guides/GuidesPage';

export const metadata: Metadata = pageMetadata({
  title: 'Frontend Interview Guides & Playbooks',
  description:
    'Free frontend interview guides: how to prepare, system design frameworks, behavioral answers and what senior and lead interviews look for.',
  path: PATHS.guides,
});

export default function Page() {
  return <GuidesPage />;
}
