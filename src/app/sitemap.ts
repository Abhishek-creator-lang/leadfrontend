import type { MetadataRoute } from 'next';
import { FORMAT_ORDER } from '@/content/formats';
import { absoluteUrl } from '@/lib/seo';
import {
  PATHS,
  companyPath,
  focusAreaPath,
  formatPath,
  guidePath,
  questionPath,
  studyPlanPath,
} from '@/routes/paths';
import { getContent, getContentUpdatedAt } from '@/server/content/catalog';

/** Every public, indexable URL. Rebuilt per request from the published catalog. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ content }, lastModified] = await Promise.all([getContent(), getContentUpdatedAt()]);
  const entry = (
    path: string,
    priority: number,
    changeFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  });

  return [
    entry(PATHS.home, 1, 'daily'),
    entry(PATHS.questions, 0.9, 'daily'),
    ...FORMAT_ORDER.map((f) => entry(formatPath(f), 0.8)),
    entry(PATHS.studyPlans, 0.8),
    entry(PATHS.focusAreas, 0.8),
    entry(PATHS.guides, 0.8),
    entry(PATHS.companies, 0.8),
    entry(PATHS.support, 0.3, 'monthly'),
    ...content.questions.map((q) => entry(questionPath(q), 0.7)),
    ...content.studyPlans.map((p) => entry(studyPlanPath(p.id), 0.7)),
    ...content.focusAreas.map((a) => entry(focusAreaPath(a.id), 0.7)),
    ...content.guides.flatMap((g) => g.chapters.map((c) => entry(guidePath(g.id, c.slug), 0.7))),
    ...content.companies.map((c) => entry(companyPath(c.slug), 0.6)),
  ];
}
