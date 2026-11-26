import type { Difficulty, QuestionSummary } from '@/content/types';
import type { InterviewRole } from '@/content/interviewer/script';
import type { InterviewPlan } from './engine';
import {
  isSpeakableTitle,
  type BehavioralMaterial,
  type InterviewMaterial,
  type QuizMaterial,
} from './material';

export type InterviewLength = 'short' | 'standard';

export interface LiveInterviewConfig {
  role: InterviewRole;
  length: InterviewLength;
  /** Speak and listen, or type. */
  mode: 'voice' | 'text';
}

export const LENGTHS: Record<
  InterviewLength,
  { label: string; minutes: number; warmup: number; behavioral: number; followups: number }
> = {
  short: { label: 'Short', minutes: 15, warmup: 3, behavioral: 1, followups: 1 },
  standard: { label: 'Standard', minutes: 25, warmup: 5, behavioral: 2, followups: 2 },
};

/** Behavioral prompts that are not stories (meta questions handled by the script itself). */
const NOT_STORIES = new Set([
  'behavioral/tell-me-about-yourself-lead-edition',
  'behavioral/questions-to-ask-the-interviewer',
  'behavioral/salary-and-level-negotiation',
  'behavioral/why-are-you-leaving-your-job',
  'behavioral/why-this-company',
  'behavioral/lead-vs-staff-vs-manager-track',
]);

function shuffle<T>(items: T[], random: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const byImportance = (a: QuestionSummary, b: QuestionSummary) =>
  (b.importance === 'high' ? 1 : 0) - (a.importance === 'high' ? 1 : 0);

/**
 * Chooses candidate questions for a live interview: a pool of speakable quiz questions at every
 * difficulty (the interviewer adapts as it goes) and the behavioral stories.
 */
export function selectQuestionIds(
  questions: QuestionSummary[],
  config: LiveInterviewConfig,
  random: () => number = Math.random
): string[] {
  const len = LENGTHS[config.length];
  const quiz = shuffle(
    questions.filter((q) => q.format === 'quiz' && isSpeakableTitle(q.title)),
    random
  ).sort(byImportance);
  const perLevel = len.warmup + 1;
  const levels: Difficulty[] = ['easy', 'medium', 'hard'];
  const quizIds = levels.flatMap((d) =>
    quiz
      .filter((q) => q.difficulty === d)
      .slice(0, perLevel)
      .map((q) => q.id)
  );
  const stories = shuffle(
    questions.filter((q) => q.format === 'behavioral' && !NOT_STORIES.has(q.id)),
    random
  ).sort(byImportance);
  // Ask for one spare story in case one has no usable prompt.
  return [...quizIds, ...stories.slice(0, len.behavioral + 1).map((q) => q.id)];
}

export function buildPlan(
  config: LiveInterviewConfig,
  materials: InterviewMaterial[]
): InterviewPlan {
  const len = LENGTHS[config.length];
  return {
    role: config.role,
    warmupCount: len.warmup,
    introFollowups: len.followups,
    quiz: materials.filter((m): m is QuizMaterial => m.kind === 'quiz'),
    behavioral: materials
      .filter((m): m is BehavioralMaterial => m.kind === 'behavioral')
      .slice(0, len.behavioral),
  };
}
