import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PAGE_TITLES } from '@/constants/navigation';
import QuestionsPage from '@/views/questions/QuestionsPage';

export const metadata: Metadata = { title: PAGE_TITLES.questions };

export default function Page() {
  // useSearchParams() needs a Suspense boundary for static rendering.
  return (
    <Suspense>
      <QuestionsPage />
    </Suspense>
  );
}
