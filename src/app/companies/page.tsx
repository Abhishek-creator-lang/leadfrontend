import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { PATHS } from '@/routes/paths';
import CompaniesPage from '@/views/companies/CompaniesPage';

export const metadata: Metadata = pageMetadata({
  title: 'Front End Interview Guides by Company',
  description:
    'Company-specific front end interview guides: the rounds, the questions asked and how to prepare for each company.',
  path: PATHS.companies,
});

export default function Page() {
  return <CompaniesPage />;
}
