import { promptWithTimeout } from '@/lib/builtInAI';
import type { AIJudgement } from '@/utils/interview/classify';

/**
 * A second opinion on a fundamentals answer from Chrome's on-device AI. Free (runs locally) and
 * optional: returns undefined when it is slow, fails or replies with anything but the expected JSON,
 * and the keyword grade stands. The engine lets it move a grade by one level at most
 * (see combineWithAI).
 */

const SYSTEM = `You grade one answer in a frontend engineering interview.
Reply with JSON only, no prose, in exactly this shape:
{"covered": string[], "incorrect": string[], "verdict": "correct" | "partial" | "incorrect"}
- "covered": the key points (copied exactly from the list you are given) the answer explains correctly, even in other words.
- "incorrect": short quotes of statements in the answer that are factually wrong. Empty if none.
- "verdict": "correct" if the answer is right and covers the main idea, "partial" if it is right but incomplete or mixes right and wrong, "incorrect" if it is mostly wrong or off-topic.
Do not reward length. Do not invent key points.`;

/** Parses the model's reply. Undefined unless it is the JSON shape asked for. */
export function parseJudgement(raw: string): AIJudgement | undefined {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return undefined;
  try {
    const j = JSON.parse(m[0]) as Record<string, unknown>;
    const strings = (v: unknown) =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, 10) : null;
    const covered = strings(j.covered);
    const incorrect = strings(j.incorrect);
    const verdict = j.verdict;
    if (!covered || !incorrect) return undefined;
    if (verdict !== 'correct' && verdict !== 'partial' && verdict !== 'incorrect') return undefined;
    return { covered, incorrect: incorrect.map((x) => x.slice(0, 160)), verdict };
  } catch {
    return undefined;
  }
}

export async function aiGradeAnswer(
  input: { question: string; modelAnswer: string; keyPoints: string[]; answer: string },
  timeoutMs = 6000
): Promise<AIJudgement | undefined> {
  const prompt = [
    `Question: ${input.question}`,
    `Model answer: ${input.modelAnswer}`,
    `Key points: ${JSON.stringify(input.keyPoints)}`,
    `Candidate's answer: """${input.answer.slice(0, 2000)}"""`,
  ].join('\n');
  const raw = await promptWithTimeout(SYSTEM, prompt, timeoutMs);
  return raw === undefined ? undefined : parseJudgement(raw);
}
