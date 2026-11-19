import type { Metadata } from 'next';
import { PAGE_TITLES } from '@/constants/navigation';
import GuidesPage from '@/views/guides/GuidesPage';

export const metadata: Metadata = { title: PAGE_TITLES.guides };

export default function Page() {
  return <GuidesPage />;
}
