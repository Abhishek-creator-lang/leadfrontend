import type { Metadata } from 'next';
import { PAGE_TITLES } from '@/constants/navigation';
import SettingsPage from '@/views/settings/SettingsPage';

export const metadata: Metadata = { title: PAGE_TITLES.settings };

export default function Page() {
  return <SettingsPage />;
}
