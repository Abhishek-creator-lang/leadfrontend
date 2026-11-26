'use server';

import { z } from 'zod';
import { getContent, getQuestionFiles } from '@/server/content/catalog';
import {
  behavioralMaterial,
  quizMaterial,
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
