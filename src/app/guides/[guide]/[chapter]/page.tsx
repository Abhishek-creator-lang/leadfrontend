import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { findRedirect, getContent, getGuideChapterBody } from '@/server/content/catalog';
import type { PageProps } from '@/types/next';
import GuideChapterPage from '@/views/guides/GuideChapterPage';

type Params = { guide: string; chapter: string };

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  const { guide, chapter } = await params;
  const { getGuide, getGuideChapter } = await getContent();
  const g = getGuide(guide);
  const c = getGuideChapter(guide, chapter);
  return { title: g && c ? `${c.title} · ${g.title}` : 'Guide not found' };
}

export default async function Page({ params }: PageProps<Params>) {
  const { guide, chapter } = await params;
  const { getGuideChapter } = await getContent();
  if (!getGuideChapter(guide, chapter)) {
    const moved =
      (await findRedirect(`/guides/${guide}/${chapter}`)) ??
      (await findRedirect(`/guides/${guide}`));
    if (moved) permanentRedirect(moved);
  }
  const md = await getGuideChapterBody(guide, chapter);
  return <GuideChapterPage guideId={guide} chapter={chapter} md={md} />;
}
