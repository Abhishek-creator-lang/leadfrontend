import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { findRedirect, getContent } from '@/server/content/catalog';
import type { PageProps } from '@/types/next';
import FocusAreaDetailPage from '@/views/focus-areas/FocusAreaDetailPage';

type Params = { id: string };

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  const { id } = await params;
  const { getFocusArea } = await getContent();
  return { title: getFocusArea(id)?.title ?? 'Focus area not found' };
}

export default async function Page({ params }: PageProps<Params>) {
  const { id } = await params;
  const { getFocusArea } = await getContent();
  if (!getFocusArea(id)) {
    const moved = await findRedirect(`/focus-areas/${id}`);
    if (moved) permanentRedirect(moved);
  }
  return <FocusAreaDetailPage id={id} />;
}
