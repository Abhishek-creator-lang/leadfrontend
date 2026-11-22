import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import { articleLd, breadcrumbLd, firstParagraph, pageMetadata } from '@/lib/seo';
import { PATHS, companyPath } from '@/routes/paths';
import {
  findRedirect,
  getCompanyBody,
  getContent,
  getContentUpdatedAt,
} from '@/server/content/catalog';
import type { PageProps } from '@/types/next';
import CompanyPage from '@/views/companies/CompanyPage';

type Params = { slug: string };

const title = (name: string) => `${name} Front End Interview Guide`;
const description = (name: string, md: string | null) =>
  firstParagraph(md ?? '') ||
  `How the ${name} front end interview works: the rounds, the questions asked and how to prepare.`;

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  const { slug } = await params;
  const c = (await getContent()).getCompany(slug);
  if (!c) return {};
  return pageMetadata({
    title: title(c.name),
    description: description(c.name, await getCompanyBody(slug)),
    path: companyPath(c.slug),
    type: 'article',
  });
}

export default async function Page({ params }: PageProps<Params>) {
  const { slug } = await params;
  const company = (await getContent()).getCompany(slug);
  if (!company) {
    const moved = await findRedirect(`/companies/${slug}`);
    if (moved) permanentRedirect(moved);
    notFound();
  }
  const [md, updated] = await Promise.all([getCompanyBody(slug), getContentUpdatedAt()]);
  const path = companyPath(company.slug);
  return (
    <>
      <JsonLd
        data={[
          articleLd({
            type: 'Article',
            headline: title(company.name),
            description: description(company.name, md),
            path,
            dateModified: updated,
          }),
          breadcrumbLd([
            { name: 'Home', path: PATHS.home },
            { name: 'Company guides', path: PATHS.companies },
            { name: company.name, path },
          ]),
        ]}
      />
      <CompanyPage slug={slug} md={md} />
    </>
  );
}
