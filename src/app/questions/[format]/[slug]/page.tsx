import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { EmptyState } from '@/components/EmptyState';
import { findRedirect, getContent, getQuestionFiles } from '@/server/content/catalog';
import type { PageProps } from '@/types/next';
import QuestionPage from '@/views/workspace/QuestionPage';

type Params = { format: string; slug: string };

const questionId = ({ format, slug }: Params) => `${format}/${slug}`;

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  const { getQuestion } = await getContent();
  return { title: getQuestion(questionId(await params))?.title ?? 'Question not found' };
}

export default async function Page({ params }: PageProps<Params>) {
  const id = questionId(await params);
  const { getQuestion } = await getContent();
  const q = getQuestion(id);
  if (!q) {
    // Renamed in the CMS: send old links (bookmarks, search engines) to the new URL.
    const moved = await findRedirect(`/questions/${id}`);
    if (moved) permanentRedirect(moved);
    return <EmptyState title="Question not found" description="It may have been renamed." />;
  }
  return <QuestionPage q={q} files={await getQuestionFiles(id)} />;
}
