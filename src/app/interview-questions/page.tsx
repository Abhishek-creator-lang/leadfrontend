import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { LANDINGS } from '@/content/landings';
import { breadcrumbLd, itemListLd, pageMetadata } from '@/lib/seo';
import { PATHS, landingPath } from '@/routes/paths';
import LandingsIndexPage from '@/views/landings/LandingsIndexPage';

export const metadata: Metadata = pageMetadata({
  title: 'Frontend Interview Questions by Technology & Level',
  description:
    'Frontend interview questions with answers by technology and level: React, JavaScript, TypeScript, CSS, HTML, senior frontend and lead frontend engineer.',
  path: PATHS.interviewQuestions,
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          itemListLd(
            'Frontend interview questions',
            LANDINGS.map((l) => ({ name: l.heading, path: landingPath(l.slug) }))
          ),
          breadcrumbLd([
            { name: 'Home', path: PATHS.home },
            { name: 'Interview questions', path: PATHS.interviewQuestions },
          ]),
        ]}
      />
      <LandingsIndexPage />
    </>
  );
}
