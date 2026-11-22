import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { findRedirect, getCompanyBody, getContent } from '@/server/content/catalog';
import type { PageProps } from '@/types/next';
import CompanyPage from '@/views/companies/CompanyPage';

type Params = { slug: string };

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  const { slug } = await params;
  const { getCompany } = await getContent();
  return { title: getCompany(slug)?.title ?? 'Company not found' };
}

export default async function Page({ params }: PageProps<Params>) {
  const { slug } = await params;
  const { getCompany } = await getContent();
  if (!getCompany(slug)) {
    const moved = await findRedirect(`/companies/${slug}`);
    if (moved) permanentRedirect(moved);
  }
  return <CompanyPage slug={slug} md={await getCompanyBody(slug)} />;
}
