import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import { FORMAT_INFO, FORMAT_ORDER, isFormat } from '@/content/formats';
import { breadcrumbLd, FORMAT_SEO, itemListLd, pageMetadata } from '@/lib/seo';
import { PATHS, formatPath, questionPath } from '@/routes/paths';
import { getContent } from '@/server/content/catalog';
import type { PageProps } from '@/types/next';
import QuestionsPage from '@/views/questions/QuestionsPage';

type Params = { format: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return FORMAT_ORDER.map((format) => ({ format }));
}

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  const { format } = await params;
  if (!isFormat(format)) return {};
  const count = (await getContent()).FORMAT_COUNTS[format];
  return pageMetadata({
    title: `${FORMAT_SEO[format].list} (${count})`,
    description: `${count} ${FORMAT_SEO[format].list.toLowerCase()} with solutions. ${FORMAT_INFO[format].description}`,
    path: formatPath(format),
  });
}

export default async function Page({ params }: PageProps<Params>) {
  const { format } = await params;
  if (!isFormat(format)) notFound();
  const questions = (await getContent()).questionsByFormat(format);
  return (
    <>
      <JsonLd
        data={[
          itemListLd(
            FORMAT_SEO[format].list,
            questions.map((q) => ({ name: q.title, path: questionPath(q) }))
          ),
          breadcrumbLd([
            { name: 'Home', path: PATHS.home },
            { name: 'Questions', path: PATHS.questions },
            { name: FORMAT_INFO[format].label, path: formatPath(format) },
          ]),
        ]}
      />
      <Suspense>
        <QuestionsPage format={format} />
      </Suspense>
    </>
  );
}
