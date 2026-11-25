import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import { FORMAT_INFO } from '@/content/formats';
import {
  breadcrumbLd,
  pageMetadata,
  plain,
  questionDescription,
  questionLd,
  questionTitle,
} from '@/lib/seo';
import { PATHS, formatPath, questionPath } from '@/routes/paths';
import { findRedirect, getContent, getQuestionFiles } from '@/server/content/catalog';
import type { PageProps } from '@/types/next';
import QuestionPage from '@/views/workspace/QuestionPage';

type Params = { format: string; slug: string };

const questionId = ({ format, slug }: Params) => `${format}/${slug}`;

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  const { getQuestion } = await getContent();
  const q = getQuestion(questionId(await params));
  if (!q) return {};
  return pageMetadata({
    title: questionTitle(q),
    description: questionDescription(q),
    path: questionPath(q),
    type: 'article',
  });
}

export default async function Page({ params }: PageProps<Params>) {
  const id = questionId(await params);
  const { getQuestion } = await getContent();
  const q = getQuestion(id);
  if (!q) {
    // Renamed in the CMS: send old links (bookmarks, search engines) to the new URL.
    const moved = await findRedirect(`/questions/${id}`);
    if (moved) permanentRedirect(moved);
    notFound();
  }
  const path = questionPath(q);
  return (
    <>
      <JsonLd
        data={[
          questionLd(q, path),
          breadcrumbLd([
            { name: 'Home', path: PATHS.home },
            { name: 'Questions', path: PATHS.questions },
            { name: FORMAT_INFO[q.format].label, path: formatPath(q.format) },
            { name: plain(q.title), path },
          ]),
        ]}
      />
      <QuestionPage q={q} files={await getQuestionFiles(id)} />
    </>
  );
}
