import type { Metadata } from 'next';
import { content, getFocusArea } from '@/content';
import type { PageProps } from '@/types/next';
import FocusAreaDetailPage from '@/views/focus-areas/FocusAreaDetailPage';

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return content.focusAreas.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  const { id } = await params;
  return { title: getFocusArea(id)?.title ?? 'Focus area not found' };
}

export default async function Page({ params }: PageProps<Params>) {
  const { id } = await params;
  return <FocusAreaDetailPage id={id} />;
}
