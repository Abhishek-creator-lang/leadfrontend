import { promptStream } from '@/lib/builtInAI';

/**
 * Asks Chrome's on-device AI for one follow-up question on a design answer, like a real interviewer
 * would. Free (runs locally) and optional: returns undefined if it is slow, fails or says something
 * that isn't a short question, and the interviewer falls back to its scripted probe.
 */

const SYSTEM = `You are a staff frontend engineer running a system design interview.
Ask exactly ONE short follow-up question (at most 25 words) that probes the weakest or vaguest part of the candidate's answer for the current step.
Be specific to what they said. Do not praise, explain or answer. Output only the question.`;

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
  return q;
}

export async function aiDesignFollowUp(
  input: { problem: string; step: string; keyPoints: string[]; answer: string },
  timeoutMs = 6000
): Promise<string | undefined> {
  const prompt = [
    `Problem: ${input.problem}`,
    `Current step: ${input.step}`,
    `Topics a strong answer covers: ${input.keyPoints.join(', ')}`,
    `Candidate's answer: """${input.answer.slice(0, 2000)}"""`,
  ].join('\n');
  try {
    const result = await Promise.race([
      promptStream(SYSTEM, prompt, () => {}),
      new Promise<string>((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
    ]);
    return cleanFollowUp(result);
  } catch {
    return undefined;
  }
}
