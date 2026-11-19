import raw from './index.generated.json';
import { FORMAT_ORDER } from './formats';
import type {
  CompanyGuide,
  ContentIndex,
  FocusArea,
  Format,
  Guide,
  QuestionMeta,
  StudyPlan,
} from './types';

/** The validated content index built by `scripts/build-index.ts`. Safe to use on client and server. */
export const content = raw as unknown as ContentIndex;

const indexBy = <T, K extends keyof T>(items: T[], key: K) =>
  new Map<T[K], T>(items.map((item) => [item[key], item]));

const questionsById = indexBy(content.questions, 'id');
const studyPlansById = indexBy(content.studyPlans, 'id');
const focusAreasById = indexBy(content.focusAreas, 'id');
const guidesById = indexBy(content.guides, 'id');
const companiesBySlug = indexBy(content.companies, 'slug');

export const getQuestion = (id: string): QuestionMeta | undefined => questionsById.get(id);
export const getStudyPlan = (id: string): StudyPlan | undefined => studyPlansById.get(id);
export const getFocusArea = (id: string): FocusArea | undefined => focusAreasById.get(id);
export const getGuide = (id: string): Guide | undefined => guidesById.get(id);
export const getCompany = (slug: string): CompanyGuide | undefined => companiesBySlug.get(slug);

export const getGuideChapter = (guideId: string, slug: string) =>
  getGuide(guideId)?.chapters.find((c) => c.slug === slug);

/** Resolves ids to questions, silently dropping unknown ids. */
export const getQuestions = (ids: readonly string[]): QuestionMeta[] =>
  ids.map(getQuestion).filter((q): q is QuestionMeta => q !== undefined);

const questionsByFormatMap = new Map<Format, QuestionMeta[]>(
  FORMAT_ORDER.map((f) => [f, content.questions.filter((q) => q.format === f)])
);

export const questionsByFormat = (format: Format) => questionsByFormatMap.get(format) ?? [];

/** Number of questions per format. */
export const FORMAT_COUNTS = Object.fromEntries(
  FORMAT_ORDER.map((f) => [f, questionsByFormat(f).length])
) as Record<Format, number>;

export function stripFrontMatter(src: string) {
  return src.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}
