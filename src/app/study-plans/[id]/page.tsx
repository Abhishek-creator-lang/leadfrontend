import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { findRedirect, getContent } from '@/server/content/catalog';
import type { PageProps } from '@/types/next';
import StudyPlanDetailPage from '@/views/study-plans/StudyPlanDetailPage';

type Params = { id: string };

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  const { id } = await params;
  const { getStudyPlan } = await getContent();
  return { title: getStudyPlan(id)?.title ?? 'Study plan not found' };
}

export default async function Page({ params }: PageProps<Params>) {
  const { id } = await params;
  const { getStudyPlan } = await getContent();
  if (!getStudyPlan(id)) {
    const moved = await findRedirect(`/study-plans/${id}`);
    if (moved) permanentRedirect(moved);
  }
  return <StudyPlanDetailPage id={id} />;
}
