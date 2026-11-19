import type { Metadata } from 'next';
import { PAGE_TITLES } from '@/constants/navigation';
import CompaniesPage from '@/views/companies/CompaniesPage';

export const metadata: Metadata = { title: PAGE_TITLES.companies };

export default function Page() {
  return <CompaniesPage />;
}
