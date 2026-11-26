import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/ogCard';
import { getContent } from '@/server/content/catalog';

export const alt = 'Company frontend interview guide';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = (await getContent()).getCompany(slug);
  if (!c) return ogCard({ title: 'Company frontend interview guide' });
  return ogCard({
    eyebrow: 'Company guide',
    title: `${c.name} frontend interview questions & process`,
    subtitle: 'The rounds, the questions asked and how to prepare',
    tags: ['Rounds', 'Questions', 'Prep tips'],
  });
}
