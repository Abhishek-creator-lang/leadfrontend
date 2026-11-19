import type { Format, QuestionMeta } from '@/content/types';

export const PATHS = {
  home: '/',
  dashboard: '/dashboard',
  questions: '/questions',
  studyPlans: '/study-plans',
  focusAreas: '/focus-areas',
  guides: '/guides',
  companies: '/companies',
  bookmarks: '/bookmarks',
  settings: '/settings',
} as const;

export const questionPath = (q: Pick<QuestionMeta, 'format' | 'slug'>) =>
  `${PATHS.questions}/${q.format}/${q.slug}`;
export const formatPath = (format: Format) => `${PATHS.questions}/${format}`;
export const studyPlanPath = (id: string) => `${PATHS.studyPlans}/${id}`;
export const focusAreaPath = (id: string) => `${PATHS.focusAreas}/${id}`;
export const guidePath = (guide: string, chapter?: string) =>
  `${PATHS.guides}/${guide}${chapter ? `/${chapter}` : ''}`;
export const companyPath = (slug: string) => `${PATHS.companies}/${slug}`;

/** True when `pathname` is a single question's workspace (`/questions/:format/:slug`). */
export const isQuestionWorkspacePath = (pathname: string) =>
  /^\/questions\/[^/]+\/[^/]+/.test(pathname);
