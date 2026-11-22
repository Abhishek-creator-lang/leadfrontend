import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import { FORMAT_INFO } from '@/content/formats';
import { breadcrumbLd, FORMAT_SEO, pageMetadata, plain, questionLd } from '@/lib/seo';
import { PATHS, formatPath, questionPath } from '@/routes/paths';
import { findRedirect, getContent, getQuestionFiles } from '@/server/content/catalog';
import type { PageProps } from '@/types/next';
import QuestionPage from '@/views/workspace/QuestionPage';

type Params = { format: string; slug: string };

const questionId = ({ format, slug }: Params) => `${format}/${slug}`;

const DIFFICULTY_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' } as const;

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  const { getQuestion } = await getContent();
  const q = getQuestion(questionId(await params));
  if (!q) return {};
  return pageMetadata({
    title: `${plain(q.title)} – ${FORMAT_SEO[q.format].question}`,
    description: `${plain(q.excerpt)} ${DIFFICULTY_LABEL[q.difficulty]} · ${q.duration} min · with a worked solution.`,
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
