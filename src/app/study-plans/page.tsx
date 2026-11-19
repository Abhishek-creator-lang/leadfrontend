import type { Metadata } from 'next';
import { PAGE_TITLES } from '@/constants/navigation';
import StudyPlansPage from '@/views/study-plans/StudyPlansPage';

export const metadata: Metadata = { title: PAGE_TITLES.studyPlans };

export default function Page() {
  return <StudyPlansPage />;
}
