import { z } from 'zod';

/**
 * Content schemas shared by the importer (`scripts/`), the admin CMS forms and its server actions.
 * Every content type is stored as one JSON document per entry (see `content_entries`).
 */

export const CONTENT_TYPES = [
  'question',
  'guide',
  'study_plan',
  'focus_area',
  'company',
  'taxonomy',
] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const formatEnum = z.enum([
  'javascript',
  'user-interface',
  'algorithms',
  'quiz',
  'system-design',
  'behavioral',
]);

export const slugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens');

export const sourceSchema = z.object({
  type: z.enum(['original', 'mit-handbook', 'mit-awesome-fesd']),
  url: z.string().url().optional(),
});

/** Question metadata (the former `meta.json`). */
export const metaSchema = z
  .object({
    slug: slugSchema,
    format: formatEnum,
    title: z.string().trim().min(3, 'Title is too short'),
    excerpt: z.string().trim().min(10, 'Write a one-line summary (10+ characters)'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    importance: z.enum(['low', 'mid', 'high']).default('mid'),
    duration: z.number().int().positive(),
    topics: z.array(z.string()).default([]),
    frameworks: z.array(z.enum(['react', 'vanilla'])).default([]),
    languages: z.array(z.enum(['js', 'ts', 'html', 'css'])).default([]),
    companies: z.array(z.string()).default([]),
    quizCategory: z
      .enum(['javascript', 'react', 'html', 'css', 'typescript', 'web', 'performance', 'security'])
      .optional(),
    sdType: z.enum(['application', 'component', 'lead']).optional(),
    source: sourceSchema.default({ type: 'original' }),
    references: z.array(z.string().url()).default([]),
  })
  .strict();

/** File path inside a question: `starter/…`, `solution/…` or a root test file. */
export const questionFilePathSchema = z
  .string()
  .regex(/^(starter\/|solution\/)?[A-Za-z0-9_.\-/]+$/, 'Invalid file path');

export const questionDocSchema = metaSchema.extend({
  prompt: z.string().default(''),
  solution: z.string().default(''),
  /** Code files keyed by path relative to the question (`starter/index.js`, `index.test.js`…). */
  files: z.record(questionFilePathSchema, z.string()).default({}),
});
export type QuestionDoc = z.infer<typeof questionDocSchema>;

export const studyPlanSchema = z.object({
  id: slugSchema,
  title: z.string().trim().min(1),
  subtitle: z.string(),
  description: z.string(),
  weeks: z.number().int().positive(),
  hoursPerWeek: z.string(),
  audience: z.string(),
  sections: z.array(
    z.object({
      title: z.string().trim().min(1),
      description: z.string().optional(),
      questions: z.array(z.string()),
    })
  ),
});
export type StudyPlanDoc = z.infer<typeof studyPlanSchema>;

export const focusAreaSchema = z.object({
  id: slugSchema,
  title: z.string().trim().min(1),
  description: z.string(),
  icon: z.string(),
  questions: z.array(z.string()),
});
export type FocusAreaDoc = z.infer<typeof focusAreaSchema>;

export const guideSchema = z.object({
  id: slugSchema,
  title: z.string().trim().min(1),
  description: z.string(),
  icon: z.string(),
});

export const guideChapterDocSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1),
  description: z.string().default(''),
  source: sourceSchema.default({ type: 'original' }),
  body: z.string().default(''),
});

export const guideDocSchema = guideSchema.extend({
  /** In reading order. */
  chapters: z.array(guideChapterDocSchema).default([]),
});
export type GuideDoc = z.infer<typeof guideDocSchema>;

export const companyDocSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1),
  title: z.string().trim().min(1),
  source: sourceSchema.default({ type: 'original' }),
  body: z.string().default(''),
});
export type CompanyDoc = z.infer<typeof companyDocSchema>;

/** Managed tag lists offered by the question editor. */
export const taxonomyDocSchema = z.object({
  topics: z.array(z.string().trim().min(1)).default([]),
  companies: z.array(z.string().trim().min(1)).default([]),
});
export type TaxonomyDoc = z.infer<typeof taxonomyDocSchema>;

export const TAXONOMY_KEY = 'default';

export const DOC_SCHEMAS = {
  question: questionDocSchema,
  guide: guideDocSchema,
  study_plan: studyPlanSchema,
  focus_area: focusAreaSchema,
  company: companyDocSchema,
  taxonomy: taxonomyDocSchema,
} as const;

export type ContentDoc = {
  question: QuestionDoc;
  guide: GuideDoc;
  study_plan: StudyPlanDoc;
  focus_area: FocusAreaDoc;
  company: CompanyDoc;
  taxonomy: TaxonomyDoc;
};

/** Public key of an entry, derived from its document (what URLs and progress refer to). */
export function docKey(type: ContentType, doc: Record<string, unknown>): string {
  switch (type) {
    case 'question':
      return `${doc.format}/${doc.slug}`;
    case 'guide':
    case 'study_plan':
    case 'focus_area':
      return String(doc.id);
    case 'company':
      return String(doc.slug);
    case 'taxonomy':
      return TAXONOMY_KEY;
  }
}

/** Human-readable title of an entry for admin lists. */
export function docTitle(type: ContentType, doc: Record<string, unknown>): string {
  if (type === 'company') return String(doc.name ?? doc.slug ?? '');
  if (type === 'taxonomy') return 'Topics & companies';
  return String(doc.title ?? '');
}

/** Formats whose questions have starter/solution code and tests. */
export const CODING_FORMATS = ['javascript', 'user-interface', 'algorithms'] as const;
