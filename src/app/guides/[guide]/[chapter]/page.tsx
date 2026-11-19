import type { Metadata } from 'next';
import { content, getGuide, getGuideChapter } from '@/content';
import { loadGuideChapter } from '@/content/server';
import type { PageProps } from '@/types/next';
import GuideChapterPage from '@/views/guides/GuideChapterPage';

type Params = { guide: string; chapter: string };

export function generateStaticParams(): Params[] {
  return content.guides.flatMap((g) => g.chapters.map((c) => ({ guide: g.id, chapter: c.slug })));
}

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  const { guide, chapter } = await params;
  const g = getGuide(guide);
  const c = getGuideChapter(guide, chapter);
  return { title: g && c ? `${c.title} · ${g.title}` : 'Guide not found' };
}

export default async function Page({ params }: PageProps<Params>) {
  const { guide, chapter } = await params;
  // Only touch the filesystem for known guides (the id becomes part of a path).
  const md = getGuide(guide) ? await loadGuideChapter(guide, chapter) : null;
  return <GuideChapterPage guideId={guide} chapter={chapter} md={md} />;
}
