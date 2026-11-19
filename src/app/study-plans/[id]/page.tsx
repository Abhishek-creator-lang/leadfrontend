import type { Metadata } from 'next';
import { content, getStudyPlan } from '@/content';
import type { PageProps } from '@/types/next';
import StudyPlanDetailPage from '@/views/study-plans/StudyPlanDetailPage';

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return content.studyPlans.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  const { id } = await params;
  return { title: getStudyPlan(id)?.title ?? 'Study plan not found' };
}

export default async function Page({ params }: PageProps<Params>) {
  const { id } = await params;
  return <StudyPlanDetailPage id={id} />;
}
