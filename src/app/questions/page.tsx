import { Suspense } from 'react';
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { PATHS } from '@/routes/paths';
import { getContent } from '@/server/content/catalog';
import QuestionsPage from '@/views/questions/QuestionsPage';

export async function generateMetadata(): Promise<Metadata> {
  const total = (await getContent()).content.questions.length;
  const rounded = Math.max(10, Math.floor(total / 50) * 50);
  return pageMetadata({
    title: `${rounded}+ Frontend Interview Questions with Solutions`,
    description: `Browse ${total} frontend interview questions with solutions: JavaScript functions, React UI coding, algorithms, quizzes, system design and behavioral. Filter by company, topic and difficulty.`,
    // Filters (?q, ?company…) are views of the same page.
    path: PATHS.questions,
  });
}

export default function Page() {
  // useSearchParams() needs a Suspense boundary for static rendering.
  return (
    <Suspense>
      <QuestionsPage />
    </Suspense>
  );
}
