import type { Metadata } from 'next';
import { NOINDEX } from '@/lib/seo';
import { PAGE_TITLES } from '@/constants/navigation';
import DashboardPage from '@/views/dashboard/DashboardPage';

// Personal progress page: the public home page (/) is the one that ranks.
export const metadata: Metadata = { title: PAGE_TITLES.dashboard, robots: NOINDEX };

export default function Page() {
  return <DashboardPage />;
}
