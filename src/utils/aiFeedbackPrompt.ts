import { FORMAT_INFO } from '@/content/formats';
import type { Format } from '@/content/types';

/** Gemini Nano has a small context window: keep the user's answer well inside it. */
export const MAX_ANSWER_CHARS = 6000;

export const AI_SYSTEM_PROMPT = `You are a lead frontend engineer interviewing a candidate for a senior or lead frontend role.
You give short, specific, honest feedback. You never invent things the candidate did not say.
Reply in Markdown with exactly these sections:
### Rubric
One line per rubric item: "- ✅ item", "- ⚠️ item (partly: why)" or "- ❌ item (missing)".
### Biggest gap
One or two sentences on the most important thing to improve.
### Follow-up question
One question a lead interviewer would ask next.
Keep the whole reply under 200 words.`;

export function buildFeedbackPrompt({
  format,
  title,
  excerpt,
  rubric,
  answer,
}: {
  format: Format;
  title: string;
  excerpt: string;
  rubric: string[];
  answer: string;
}): string {
  const trimmed =
    answer.length > MAX_ANSWER_CHARS
      ? `${answer.slice(0, MAX_ANSWER_CHARS)}\n[answer truncated]`
      : answer;
  return [
    `Round: ${FORMAT_INFO[format].label}`,
    `Question: ${title.replace(/`/g, '')}`,
    excerpt ? `Brief: ${excerpt}` : null,
    'Rubric:',
    ...rubric.map((r) => `- ${r}`),
    '',
    "Candidate's answer:",
    '"""',
    trimmed.trim(),
    '"""',
  ]
    .filter((l) => l !== null)
    .join('\n');
}
