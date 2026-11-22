import { FORMAT_ORDER } from './formats';
import type {
  CompanyGuide,
  ContentIndex,
  FocusArea,
  Format,
  Guide,
  GuideChapter,
  QuestionMeta,
  QuestionSummary,
  StudyPlan,
} from './types';

/** Fast lookups over a content index. Built on the server per content version and in the browser once. */
export interface ContentLookups<Q extends QuestionSummary = QuestionMeta> {
  content: ContentIndex<Q>;
  getQuestion: (id: string) => Q | undefined;
  getStudyPlan: (id: string) => StudyPlan | undefined;
  getFocusArea: (id: string) => FocusArea | undefined;
  getGuide: (id: string) => Guide | undefined;
  getCompany: (slug: string) => CompanyGuide | undefined;
  getGuideChapter: (guideId: string, slug: string) => GuideChapter | undefined;
  /** Resolves ids to questions, silently dropping unknown ids. */
  getQuestions: (ids: readonly string[]) => Q[];
  questionsByFormat: (format: Format) => Q[];
  /** Number of questions per format. */
  FORMAT_COUNTS: Record<Format, number>;
}

const indexBy = <T, K extends keyof T>(items: T[], key: K) =>
  new Map<T[K], T>(items.map((item) => [item[key], item]));

export function createLookups<Q extends QuestionSummary>(content: ContentIndex<Q>): ContentLookups<Q> {
  const questions = indexBy(content.questions, 'id');
  const studyPlans = indexBy(content.studyPlans, 'id');
  const focusAreas = indexBy(content.focusAreas, 'id');
  const guides = indexBy(content.guides, 'id');
  const companies = indexBy(content.companies, 'slug');
  const byFormat = new Map<Format, Q[]>(
    FORMAT_ORDER.map((f) => [f, content.questions.filter((q) => q.format === f)])
  );
  const getQuestion = (id: string) => questions.get(id);
  const questionsByFormat = (format: Format) => byFormat.get(format) ?? [];

  return {
    content,
    getQuestion,
    getStudyPlan: (id) => studyPlans.get(id),
    getFocusArea: (id) => focusAreas.get(id),
    getGuide: (id) => guides.get(id),
    getCompany: (slug) => companies.get(slug),
    getGuideChapter: (guideId, slug) => guides.get(guideId)?.chapters.find((c) => c.slug === slug),
    getQuestions: (ids) =>
      ids.map(getQuestion).filter((q): q is Q => q !== undefined),
    questionsByFormat,
    FORMAT_COUNTS: Object.fromEntries(
      FORMAT_ORDER.map((f) => [f, questionsByFormat(f).length])
    ) as Record<Format, number>,
  };
}

/** An empty index (no content yet, or the database isn't reachable). */
export const EMPTY_CONTENT: ContentIndex = {
  generatedAt: new Date(0).toISOString(),
  questions: [],
  studyPlans: [],
  focusAreas: [],
  guides: [],
  companies: [],
};
