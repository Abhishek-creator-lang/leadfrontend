import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/ogCard';
import { getContent } from '@/server/content/catalog';
import { planQuestionIds } from '@/utils/progress';

export const alt = 'Frontend interview study plan';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = (await getContent()).getStudyPlan(id);
  if (!p) return ogCard({ title: 'Frontend interview study plan' });
  return ogCard({
    eyebrow: 'Study plan',
    title: p.title,
    subtitle: p.subtitle,
    tags: [
      `${p.weeks} ${p.weeks === 1 ? 'week' : 'weeks'}`,
      `${planQuestionIds(p).length} questions`,
    ],
  });
}
