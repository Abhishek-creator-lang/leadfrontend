import { FORMAT_INFO } from '@/content/formats';
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/ogCard';
import { plain } from '@/lib/seo';
import { getContent } from '@/server/content/catalog';

export const alt = 'Frontend interview question';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default async function Image({
  params,
}: {
  params: Promise<{ format: string; slug: string }>;
}) {
  const { format, slug } = await params;
  const { getQuestion, getCompany } = await getContent();
  const q = getQuestion(`${format}/${slug}`);
  if (!q) return ogCard({ title: 'Frontend interview question' });
  return ogCard({
    eyebrow: FORMAT_INFO[q.format].label,
    title: plain(q.title),
    subtitle: q.topics.slice(0, 4).join(' · ') || undefined,
    tags: [
      cap(q.difficulty),
      `${q.duration} min`,
      ...q.companies.slice(0, 3).map((c) => getCompany(c)?.name ?? c),
    ],
  });
}
