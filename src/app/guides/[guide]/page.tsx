import { notFound, permanentRedirect } from 'next/navigation';
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
    notFound();
  }

  const [first] = guide.chapters;
  if (!first) notFound();
  // Permanent: the chapter URL is the canonical one for this content.
  permanentRedirect(guidePath(guide.id, first.slug));
}
