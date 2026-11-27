import { promptWithTimeout } from '@/lib/builtInAI';
import { COMPANY_FACTS, INTERVIEWER } from '@/content/interviewer/script';

/**
 * Answers the candidate's question at the end of the interview with Chrome's on-device AI, in the
 * interviewer's voice and only from the team facts the script uses. Undefined when the model is
 * missing, slow, or replies with something that doesn't sound like the interviewer; the keyword
 * answer from the script is used instead.
 */

const SYSTEM = `You are ${INTERVIEWER.name}, a ${INTERVIEWER.role}, at the end of a job interview. The candidate asked you a question.
Answer in a friendly, spoken style in at most 60 words, as 1 to 3 plain sentences.
Use ONLY these facts about the team:
${COMPANY_FACTS.map((f) => `- ${f}`).join('\n')}
If the facts don't cover the question, say honestly that you don't know the details and the recruiter can help.
Never promise a hiring outcome. Never invent numbers, names or salaries. No lists, no markdown.`;

/** The reply, cleaned, or undefined if it isn't a short spoken answer. */
export function cleanInterviewerAnswer(raw: string): string | undefined {
  if (/^\s*([-*•]|\d+[.)])\s/m.test(raw)) return undefined; // a list
  const text = raw
    .replace(/[*_`#>]/g, '')
    .replace(/^\s*(answer|aarav|interviewer)\s*:\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["“]|["”]$/g, '');
  const words = text.split(' ').filter(Boolean).length;
  if (words < 5 || words > 90) return undefined;
  if (/\b(as an ai|language model|i'?m an ai|i am an ai|chatbot)\b/i.test(text)) return undefined;
  return text;
}

export async function aiInterviewerAnswer(
  question: string,
  timeoutMs = 6000
): Promise<string | undefined> {
  const raw = await promptWithTimeout(
    SYSTEM,
    `Candidate's question: """${question.slice(0, 500)}"""`,
    timeoutMs
  );
  return raw === undefined ? undefined : cleanInterviewerAnswer(raw);
}
