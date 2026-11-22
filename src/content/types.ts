export type Format =
  | 'javascript'
  | 'user-interface'
  | 'algorithms'
  | 'quiz'
  | 'system-design'
  | 'behavioral';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Importance = 'low' | 'mid' | 'high';
export type Framework = 'react' | 'vanilla';
export type Language = 'js' | 'ts' | 'html' | 'css';
export type QuizCategory = 'javascript' | 'react' | 'html' | 'css' | 'typescript' | 'web' | 'performance' | 'security';

export interface SourceInfo {
  /** original = written for this app. mit-handbook = imported from yangshun/front-end-interview-handbook (MIT). */
  type: 'original' | 'mit-handbook' | 'mit-awesome-fesd';
  url?: string;
}

export interface QuestionMeta {
  slug: string;
  format: Format;
  title: string;
  excerpt: string;
  difficulty: Difficulty;
  importance: Importance;
  duration: number; // minutes
  topics: string[];
  frameworks: Framework[];
  languages: Language[];
  companies: string[];
  quizCategory?: QuizCategory;
  /** for system design: 'application' | 'component' | 'lead' */
  sdType?: 'application' | 'component' | 'lead';
  source: SourceInfo;
  references: string[];
  /** filled by build-index */
  id: string; // `${format}/${slug}`
  hasStarter: boolean;
  hasTests: boolean;
  files: string[]; // relative file names inside the question folder
}

/** Question fields only the question page needs. They are left out of the catalog sent to the browser. */
export type QuestionDetailKey =
  | 'references'
  | 'files'
  | 'source'
  | 'frameworks'
  | 'languages'
  | 'sdType'
  | 'hasStarter'
  | 'hasTests';

/** A question as listed, searched and filtered in the browser. */
export type QuestionSummary = Omit<QuestionMeta, QuestionDetailKey>;

export interface StudyPlan {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  weeks: number;
  hoursPerWeek: string;
  audience: string;
  sections: { title: string; description?: string; questions: string[] }[];
}

export interface FocusArea {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: string[];
}

export interface GuideChapter {
  guide: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  source: SourceInfo;
}

export interface Guide {
  id: string;
  title: string;
  description: string;
  icon: string;
  chapters: GuideChapter[];
}

export interface CompanyGuide {
  slug: string;
  title: string;
  name: string;
  source: SourceInfo;
}

/** The content catalog. The server holds full questions; the browser gets `ClientContentIndex`. */
export interface ContentIndex<Q extends QuestionSummary = QuestionMeta> {
  generatedAt: string;
  questions: Q[];
  studyPlans: StudyPlan[];
  focusAreas: FocusArea[];
  guides: Guide[];
  companies: CompanyGuide[];
}

export type ClientContentIndex = ContentIndex<QuestionSummary>;
