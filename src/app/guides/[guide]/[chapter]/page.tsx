import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import { articleLd, breadcrumbLd, pageMetadata } from '@/lib/seo';
import { PATHS, guidePath } from '@/routes/paths';
import {
  findRedirect,
  getContent,
  getContentUpdatedAt,
  getGuideChapterBody,
} from '@/server/content/catalog';
import type { PageProps } from '@/types/next';
import GuideChapterPage from '@/views/guides/GuideChapterPage';

type Params = { guide: string; chapter: string };

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  const { guide, chapter } = await params;
  const { getGuide, getGuideChapter } = await getContent();
  const g = getGuide(guide);
  const c = getGuideChapter(guide, chapter);
  if (!g || !c) return {};
  return pageMetadata({
    title: `${c.title} – ${g.title}`,
    description: c.description || g.description,
    path: guidePath(g.id, c.slug),
    type: 'article',
    ogImage: true,
  });
}

export default async function Page({ params }: PageProps<Params>) {
  const { guide, chapter } = await params;
  const { getGuide, getGuideChapter } = await getContent();
  const g = getGuide(guide);
  const c = getGuideChapter(guide, chapter);
  if (!g || !c) {
    const moved =
      (await findRedirect(`/guides/${guide}/${chapter}`)) ??
      (await findRedirect(`/guides/${guide}`));
    if (moved) permanentRedirect(moved);
    notFound();
  }
  const [md, updated] = await Promise.all([
    getGuideChapterBody(guide, chapter),
    getContentUpdatedAt(),
  ]);
  const path = guidePath(g.id, c.slug);
  const guideHome = guidePath(g.id, g.chapters[0]?.slug);
  return (
    <>
      <JsonLd
        data={[
          articleLd({
            headline: c.title,
            description: c.description || g.description,
            path,
            partOf: { name: g.title, path: guideHome },
            dateModified: updated,
          }),
          breadcrumbLd([
            { name: 'Home', path: PATHS.home },
            { name: 'Guides', path: PATHS.guides },
            { name: g.title, path: guideHome },
            { name: c.title, path },
          ]),
        ]}
      />
      <GuideChapterPage guideId={guide} chapter={chapter} md={md} />
    </>
  );
}
