import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { PATHS } from '@/routes/paths';
import StudyPlansPage from '@/views/study-plans/StudyPlansPage';

export const metadata: Metadata = pageMetadata({
  title: 'Front End Interview Study Plans',
  description:
    'Structured front end interview study plans for every timeline: curated JavaScript, React, algorithms and system design questions, week by week.',
  path: PATHS.studyPlans,
});

export default function Page() {
  return <StudyPlansPage />;
}
