import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { PATHS } from '@/routes/paths';
import FocusAreasPage from '@/views/focus-areas/FocusAreasPage';

export const metadata: Metadata = pageMetadata({
  title: 'Frontend Interview Questions by Topic',
  description:
    'Practice frontend interview questions by topic: accessibility, async JavaScript, performance, state management, forms, networking and more.',
  path: PATHS.focusAreas,
});

export default function Page() {
  return <FocusAreasPage />;
}
