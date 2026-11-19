import type { Metadata } from 'next';
import { PAGE_TITLES } from '@/constants/navigation';
import DashboardPage from '@/views/dashboard/DashboardPage';

export const metadata: Metadata = { title: PAGE_TITLES.dashboard };

export default function Page() {
  return <DashboardPage />;
}
