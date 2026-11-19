import type { Metadata } from 'next';
import { PAGE_TITLES } from '@/constants/navigation';
import FocusAreasPage from '@/views/focus-areas/FocusAreasPage';

export const metadata: Metadata = { title: PAGE_TITLES.focusAreas };

export default function Page() {
  return <FocusAreasPage />;
}
