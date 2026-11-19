import { redirect } from 'next/navigation';
import { EmptyState } from '@/components/EmptyState';
import { content, getGuide } from '@/content';
import { guidePath } from '@/routes/paths';
import type { PageProps } from '@/types/next';

type Params = { guide: string };

export function generateStaticParams(): Params[] {
  return content.guides.map(({ id }) => ({ guide: id }));
}

/** A guide's landing URL opens its first chapter. */
export default async function Page({ params }: PageProps<Params>) {
  const { guide: guideId } = await params;
  const guide = getGuide(guideId);
  if (!guide) return <EmptyState title="Guide not found" />;

  const [first] = guide.chapters;
  if (!first) return <EmptyState title="Chapter not found" />;
  redirect(guidePath(guide.id, first.slug));
}
