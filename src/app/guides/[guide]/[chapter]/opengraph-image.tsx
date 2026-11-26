import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/ogCard';
import { getContent } from '@/server/content/catalog';

export const alt = 'Frontend interview guide chapter';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ guide: string; chapter: string }>;
}) {
  const { guide, chapter } = await params;
  const { getGuide, getGuideChapter } = await getContent();
  const g = getGuide(guide);
  const c = getGuideChapter(guide, chapter);
  if (!g || !c) return ogCard({ title: 'Frontend interview guide' });
  return ogCard({ eyebrow: g.title, title: c.title, subtitle: c.description || undefined });
}
