import { promptWithTimeout } from '@/lib/builtInAI';

/**
 * Asks Chrome's on-device AI for one follow-up question, like a real interviewer would. Free (runs
 * locally) and optional: returns undefined if it is slow, fails or says something that isn't a short
 * question, and the interviewer falls back to its scripted line.
 */

export type FollowUpKind = 'intro' | 'behavioral' | 'design';

/** What the scripted interviewer wanted to find out with its behavioral probe. */
export type ProbeGoal = 'more' | 'ownership' | 'result' | 'reflect';

const RULES =
  'Ask exactly ONE short follow-up question (at most 25 words). Be specific to what they said. Do not praise, explain or answer. Output only the question.';

const SYSTEM: Record<FollowUpKind, string> = {
  intro: `You are a staff frontend engineer starting a job interview. The candidate just introduced themselves.
Ask about the most interesting thing they mentioned: their scope, a project, or a decision they made. ${RULES}`,
  behavioral: `You are a staff frontend engineer asking a behavioral interview question about leadership and teamwork.
The candidate is telling a story. ${RULES}`,
  design: `You are a staff frontend engineer running a system design interview.
Probe the weakest or vaguest part of the candidate's answer for the current step. ${RULES}`,
};

const GOAL: Record<ProbeGoal, string> = {
  more: 'Ask for more detail about the situation and what was at stake.',
  ownership: 'They said "we" a lot: ask what they personally did.',
  result: 'Ask how it turned out, ideally with a measurable result.',
  reflect: 'Ask what they learned or would do differently.',
};

export function cleanFollowUp(raw: string): string | undefined {
  const line = raw
    .replace(/[*_`#>]/g, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find(Boolean);
  if (!line) return undefined;
  const q = line
    .replace(/^(question|follow-?up)\s*:\s*/i, '')
    .replace(/^["“]|["”]$/g, '')
    .trim();
  const words = q.split(/\s+/).length;
  if (!q.endsWith('?') || words < 4 || words > 35) return undefined;
  if (/\b(as an ai|language model)\b/i.test(q)) return undefined;
  return q;
}

export async function aiFollowUp(
  kind: FollowUpKind,
  input: {
    /** What was asked (the intro question, the story prompt, or the design problem and step). */
    question: string;
    answer: string;
    /** Design: topics a strong answer covers. */
    keyPoints?: string[];
    /** Behavioral: what the follow-up should find out. */
    goal?: ProbeGoal;
  },
  timeoutMs = 6000
): Promise<string | undefined> {
  const prompt = [
    `Question asked: ${input.question}`,
    ...(input.keyPoints?.length
      ? [`Topics a strong answer covers: ${input.keyPoints.join(', ')}`]
      : []),
    ...(input.goal ? [`Goal of your follow-up: ${GOAL[input.goal]}`] : []),
    `Candidate's answer: """${input.answer.slice(0, 2000)}"""`,
  ].join('\n');
  const raw = await promptWithTimeout(SYSTEM[kind], prompt, timeoutMs);
  return raw === undefined ? undefined : cleanFollowUp(raw);
}

/** Design-round follow-up (kept for existing callers). */
export function aiDesignFollowUp(
  input: { problem: string; step: string; keyPoints: string[]; answer: string },
  timeoutMs = 6000
): Promise<string | undefined> {
  return aiFollowUp(
    'design',
    {
      question: `${input.problem}. Current step: ${input.step}`,
      answer: input.answer,
      keyPoints: input.keyPoints,
    },
    timeoutMs
  );
}
