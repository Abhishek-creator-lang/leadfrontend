import type { MetadataRoute } from 'next';
import { LANDINGS } from '@/content/landings';
import { FORMAT_ORDER } from '@/content/formats';
import { absoluteUrl } from '@/lib/seo';
import {
  PATHS,
  companyPath,
  focusAreaPath,
  formatPath,
  guidePath,
  landingPath,
  questionPath,
  studyPlanPath,
} from '@/routes/paths';
import { getContent, getContentUpdatedAt, getPublishedDates } from '@/server/content/catalog';

/**
 * Every public, indexable URL. Rebuilt per request from the published catalog. Detail pages carry
 * the date their entry was last published; list pages the date anything was last published.
 * (Google ignores `priority` and `changefreq`, so they're left out.)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ content }, catalogDate, dates] = await Promise.all([
    getContent(),
    getContentUpdatedAt(),
    getPublishedDates(),
  ]);
  const entry = (path: string, lastModified: Date = catalogDate) => ({
    url: absoluteUrl(path),
    lastModified,
  });
  const dated = (path: string, key: string) => entry(path, dates.get(key) ?? catalogDate);

  return [
    entry(PATHS.home),
    entry(PATHS.questions),
    ...FORMAT_ORDER.map((f) => entry(formatPath(f))),
    entry(PATHS.interviewQuestions),
    ...LANDINGS.map((l) => entry(landingPath(l.slug))),
    entry(PATHS.studyPlans),
    entry(PATHS.focusAreas),
    entry(PATHS.guides),
    entry(PATHS.companies),
    entry(PATHS.mockInterview),
    entry(PATHS.support),
    ...[PATHS.terms, PATHS.privacy, PATHS.disclaimer, PATHS.copyright, PATHS.licenses].map((p) =>
      entry(p)
    ),
    ...content.questions.map((q) => dated(questionPath(q), `question:${q.id}`)),
    ...content.studyPlans.map((p) => dated(studyPlanPath(p.id), `study_plan:${p.id}`)),
    ...content.focusAreas.map((a) => dated(focusAreaPath(a.id), `focus_area:${a.id}`)),
    ...content.guides.flatMap((g) =>
      g.chapters.map((c) => dated(guidePath(g.id, c.slug), `guide:${g.id}`))
    ),
    ...content.companies.map((c) => dated(companyPath(c.slug), `company:${c.slug}`)),
  ];
}
