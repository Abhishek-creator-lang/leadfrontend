import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbLd, itemListLd, pageMetadata, plain } from '@/lib/seo';
import { PATHS, focusAreaPath, questionPath } from '@/routes/paths';
import { findRedirect, getContent } from '@/server/content/catalog';
import type { PageProps } from '@/types/next';
import FocusAreaDetailPage from '@/views/focus-areas/FocusAreaDetailPage';

type Params = { id: string };

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  const { id } = await params;
  const a = (await getContent()).getFocusArea(id);
  if (!a) return {};
  return pageMetadata({
    title: `${a.title} Interview Questions (${a.questions.length})`,
    description: a.description,
    path: focusAreaPath(a.id),
  });
}

export default async function Page({ params }: PageProps<Params>) {
  const { id } = await params;
  const { getFocusArea, getQuestions } = await getContent();
  const area = getFocusArea(id);
  if (!area) {
    const moved = await findRedirect(`/focus-areas/${id}`);
    if (moved) permanentRedirect(moved);
    notFound();
  }
  return (
    <>
      <JsonLd
        data={[
          itemListLd(
            `${area.title} interview questions`,
            getQuestions(area.questions).map((q) => ({
              name: plain(q.title),
              path: questionPath(q),
            }))
          ),
          breadcrumbLd([
            { name: 'Home', path: PATHS.home },
            { name: 'Focus areas', path: PATHS.focusAreas },
            { name: area.title, path: focusAreaPath(area.id) },
          ]),
        ]}
      />
      <FocusAreaDetailPage id={id} />
    </>
  );
}
