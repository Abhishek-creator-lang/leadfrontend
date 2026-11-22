import { permanentRedirect, redirect } from 'next/navigation';
import { EmptyState } from '@/components/EmptyState';
import { guidePath } from '@/routes/paths';
import { findRedirect, getContent } from '@/server/content/catalog';
import type { PageProps } from '@/types/next';

type Params = { guide: string };

/** A guide's landing URL opens its first chapter. */
export default async function Page({ params }: PageProps<Params>) {
  const { guide: guideId } = await params;
  const { getGuide } = await getContent();
  const guide = getGuide(guideId);
  if (!guide) {
    const moved = await findRedirect(`/guides/${guideId}`);
    if (moved) permanentRedirect(moved);
    return <EmptyState title="Guide not found" />;
  }

  const [first] = guide.chapters;
  if (!first) return <EmptyState title="Chapter not found" />;
  redirect(guidePath(guide.id, first.slug));
}
