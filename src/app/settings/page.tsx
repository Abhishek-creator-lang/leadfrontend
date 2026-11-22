import type { Metadata } from 'next';
import { NOINDEX } from '@/lib/seo';
import { PAGE_TITLES } from '@/constants/navigation';
import SettingsPage from '@/views/settings/SettingsPage';

export const metadata: Metadata = { title: PAGE_TITLES.settings, robots: NOINDEX };

export default function Page() {
  return <SettingsPage />;
}
