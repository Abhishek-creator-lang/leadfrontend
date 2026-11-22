import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbLd, itemListLd, pageMetadata, sentences } from '@/lib/seo';
import { PATHS, questionPath, studyPlanPath } from '@/routes/paths';
import { findRedirect, getContent } from '@/server/content/catalog';
import type { PageProps } from '@/types/next';
import { planQuestionIds } from '@/utils/progress';
import StudyPlanDetailPage from '@/views/study-plans/StudyPlanDetailPage';

type Params = { id: string };

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  const { id } = await params;
  const p = (await getContent()).getStudyPlan(id);
  if (!p) return {};
  return pageMetadata({
    title: `${p.title}: ${p.weeks}-Week Front End Interview Study Plan`,
    description: sentences(p.subtitle, p.description),
    path: studyPlanPath(p.id),
  });
}

export default async function Page({ params }: PageProps<Params>) {
  const { id } = await params;
  const { getStudyPlan, getQuestions } = await getContent();
  const plan = getStudyPlan(id);
  if (!plan) {
    const moved = await findRedirect(`/study-plans/${id}`);
    if (moved) permanentRedirect(moved);
    notFound();
  }
  const questions = getQuestions(planQuestionIds(plan));
  return (
    <>
      <JsonLd
        data={[
          itemListLd(
            plan.title,
            questions.map((q) => ({ name: q.title, path: questionPath(q) }))
          ),
          breadcrumbLd([
            { name: 'Home', path: PATHS.home },
            { name: 'Study plans', path: PATHS.studyPlans },
            { name: plan.title, path: studyPlanPath(plan.id) },
          ]),
        ]}
      />
      <StudyPlanDetailPage id={id} />
    </>
  );
}
