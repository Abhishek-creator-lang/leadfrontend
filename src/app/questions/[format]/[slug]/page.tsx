import type { Metadata } from 'next';
import { EmptyState } from '@/components/EmptyState';
import { content, getQuestion } from '@/content';
import { loadQuestionFiles } from '@/content/server';
import type { PageProps } from '@/types/next';
import QuestionPage from '@/views/workspace/QuestionPage';

type Params = { format: string; slug: string };

const questionId = ({ format, slug }: Params) => `${format}/${slug}`;

export function generateStaticParams(): Params[] {
  return content.questions.map(({ format, slug }) => ({ format, slug }));
}

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  return { title: getQuestion(questionId(await params))?.title ?? 'Question not found' };
}

export default async function Page({ params }: PageProps<Params>) {
  const q = getQuestion(questionId(await params));
  if (!q) return <EmptyState title="Question not found" description="It may have been renamed." />;
  return <QuestionPage q={q} files={await loadQuestionFiles(q)} />;
}
