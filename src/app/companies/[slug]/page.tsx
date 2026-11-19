import type { Metadata } from 'next';
import { content, getCompany } from '@/content';
import { loadCompany } from '@/content/server';
import type { PageProps } from '@/types/next';
import CompanyPage from '@/views/companies/CompanyPage';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return content.companies.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  const { slug } = await params;
  return { title: getCompany(slug)?.title ?? 'Company not found' };
}

export default async function Page({ params }: PageProps<Params>) {
  const { slug } = await params;
  // Only touch the filesystem for known companies (the slug becomes part of a path).
  const md = getCompany(slug) ? await loadCompany(slug) : null;
  return <CompanyPage slug={slug} md={md} />;
}
