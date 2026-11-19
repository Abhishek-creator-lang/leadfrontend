import { z } from 'zod';

export const formatEnum = z.enum([
  'javascript',
  'user-interface',
  'algorithms',
  'quiz',
  'system-design',
  'behavioral',
]);

export const sourceSchema = z.object({
  type: z.enum(['original', 'mit-handbook', 'mit-awesome-fesd']),
  url: z.string().url().optional(),
});

export const metaSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    format: formatEnum,
    title: z.string().min(3),
    excerpt: z.string().min(10),
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

export const studyPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  weeks: z.number(),
  hoursPerWeek: z.string(),
  audience: z.string(),
  sections: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      questions: z.array(z.string()),
    })
  ),
});

export const focusAreaSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  questions: z.array(z.string()),
});

export const guideSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
});
