'use server';

import { z } from 'zod';
import type { Difficulty } from '@/content/types';
import { getContent, getQuestionFiles } from '@/server/content/catalog';
import {
  behavioralMaterial,
  codingMaterial,
  quizMaterial,
  type CodingMaterial,
  type InterviewMaterial,
} from '@/utils/interview/material';

/**
 * Loads what the live interviewer needs for the chosen questions: the spoken question, key points
 * and a one-line explanation. Only these extracts are sent, never full solutions. Public (guests can
 * interview too), so input is validated and capped.
 */
const idsSchema = z
  .array(z.string().regex(/^(quiz|behavioral)\/[a-z0-9-]{1,120}$/))
  .min(1)
  .max(24);

export async function loadInterviewMaterialAction(ids: string[]): Promise<InterviewMaterial[]> {
  const parsed = idsSchema.safeParse(ids);
  if (!parsed.success) return [];
  const { getQuestion } = await getContent();
  const out = await Promise.all(
    [...new Set(parsed.data)].map(async (id) => {
      const q = getQuestion(id);
      if (!q) return null;
      const files = await getQuestionFiles(id);
      if (q.format === 'quiz') return quizMaterial(q, files['solution.md'] ?? '');
      return behavioralMaterial(q, files['prompt.md'] ?? '');
    })
  );
  return out.filter((m): m is InterviewMaterial => m !== null);
}

const roleSchema = z.enum(['senior', 'lead']);
const excludeSchema = z.array(z.string().max(200)).max(1000);

const LEVELS: Record<'senior' | 'lead', Difficulty[]> = {
  senior: ['medium', 'easy'],
  lead: ['medium', 'hard'],
};

/**
 * Picks the coding problem for a live interview: a JavaScript question with starter code and tests,
 * at the role's level, preferring high-importance ones the candidate hasn't solved. Sends the
 * starter, tests and interviewer notes (hints, follow-ups): never the reference solution.
 */
export async function loadCodingQuestionAction(
  role: string,
  exclude: string[] = []
): Promise<CodingMaterial | null> {
  const r = roleSchema.safeParse(role);
  if (!r.success) return null;
  const skip = new Set(excludeSchema.safeParse(exclude).data ?? []);
  const { content } = await getContent();
  const levels = LEVELS[r.data];
  const rank = (d: Difficulty, importance: string) =>
    (levels.indexOf(d) === 0 ? 2 : levels.includes(d) ? 1 : 0) + (importance === 'high' ? 1 : 0);
  const candidates = content.questions
    .filter((q) => q.format === 'javascript' && q.hasTests && q.hasStarter && levels.includes(q.difficulty))
    .map((q) => ({ q, score: rank(q.difficulty, q.importance) + (skip.has(q.id) ? -3 : 0) + Math.random() }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  for (const { q } of candidates) {
    const m = codingMaterial(q, await getQuestionFiles(q.id));
    if (m) return m;
  }
  return null;
}
