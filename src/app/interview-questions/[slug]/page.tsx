import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import { getLanding, LANDINGS, landingQuestions } from '@/content/landings';
import { breadcrumbLd, itemListLd, pageMetadata, plain } from '@/lib/seo';
import { PATHS, landingPath, questionPath } from '@/routes/paths';
import { getContent } from '@/server/content/catalog';
import type { PageProps } from '@/types/next';
import LandingPage from '@/views/landings/LandingPage';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return LANDINGS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<Params>): Promise<Metadata> {
  const landing = getLanding((await params).slug);
  if (!landing) return {};
  const count = landingQuestions(landing, (await getContent()).content.questions).length;
  return pageMetadata({
    title: count ? `${landing.title} (${count})` : landing.title,
    description: landing.description,
    path: landingPath(landing.slug),
  });
}

export default async function Page({ params }: PageProps<Params>) {
  const { slug } = await params;
  const landing = getLanding(slug);
  if (!landing) notFound();
  const questions = landingQuestions(landing, (await getContent()).content.questions);
  return (
    <>
      <JsonLd
        data={[
          itemListLd(
            landing.heading,
            questions.map((q) => ({ name: plain(q.title), path: questionPath(q) }))
          ),
          breadcrumbLd([
            { name: 'Home', path: PATHS.home },
            { name: 'Interview questions', path: PATHS.interviewQuestions },
            { name: landing.heading, path: landingPath(slug) },
          ]),
        ]}
      />
      <LandingPage slug={slug} />
    </>
  );
}
