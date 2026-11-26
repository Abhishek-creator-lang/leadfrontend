import type { Difficulty, QuizCategory } from '@/content/types';

/**
 * What the live interviewer needs from a question, extracted from its Markdown on the server so the
 * browser never downloads full solutions. Pure functions: unit-tested in material.test.ts.
 */

export interface QuizMaterial {
  kind: 'quiz';
  id: string;
  /** Question as the interviewer says it. */
  ask: string;
  title: string;
  difficulty: Difficulty;
  category: QuizCategory | null;
  /** Terms a good answer mentions (from the TL;DR's bold terms). */
  keyPoints: string[];
  /** One-sentence explanation, said when the candidate doesn't know. */
  summary: string;
}

export interface BehavioralMaterial {
  kind: 'behavioral';
  id: string;
  ask: string;
  title: string;
  /** What the interviewer is assessing (bold terms of that section). */
  assessing: string[];
}

export type InterviewMaterial = QuizMaterial | BehavioralMaterial;

/** Markdown → plain spoken text: no code ticks, emphasis, links or extra spaces. */
export function plainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<\/?([a-zA-Z][\w-]*)[^>]*>/g, '$1')
    .replace(/[`*_>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Text of a `## Heading` section (up to the next `## `), or ''. */
export function section(md: string, heading: RegExp): string {
  const lines = md.split(/\r?\n/);
  const start = lines.findIndex((l) => /^##\s/.test(l) && heading.test(l));
  if (start < 0) return '';
  const end = lines.findIndex((l, i) => i > start && /^##\s/.test(l));
  return lines
    .slice(start + 1, end < 0 ? undefined : end)
    .join('\n')
    .trim();
}

/** Bold words that are emphasis, not concepts an answer should mention. */
const NOT_KEY_POINTS =
  /^(create|remove|modify|insert|update|add|use|avoid|never|always|do|don't|not|only|both|yes|no|note|why|how|what|when|bad|good|fix|wrong|right|true|false|example|important|tip)$/i;

/** `**bold**` terms, plain and de-duplicated (case-insensitive). Skips emphasis and long phrases. */
export function boldTerms(md: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of md.matchAll(/\*\*([^*]{2,60})\*\*/g)) {
    const term = plainText(m[1])
      .replace(/^[\s,;:.\-–—]+|[\s,;:.]+$/g, '')
      .trim();
    const key = term.toLowerCase();
    const words = term.split(/\s+/).length;
    if (term && words <= 5 && !NOT_KEY_POINTS.test(term) && !seen.has(key)) {
      seen.add(key);
      out.push(term);
    }
  }
  return out;
}

const firstSentence = (text: string) => {
  const m = text.match(/^(.{20,}?[.!?])(\s|$)/);
  return (m ? m[1] : text).slice(0, 280);
};

/** Turns a quiz title into something an interviewer would say. */
export function spokenQuestion(title: string): string {
  const t = plainText(title);
  if (/[?]$/.test(t)) return t;
  if (/^(explain|describe|compare|discuss)\b/i.test(t)) return `${t}.`.replace(/\.\.$/, '.');
  return `Can you explain ${t.charAt(0).toLowerCase()}${t.slice(1)}?`;
}

/** Quiz titles that read badly out loud (inline code samples). */
export const isSpeakableTitle = (title: string) =>
  title.length <= 120 && !/[{};]|=>/.test(title) && (title.match(/`/g)?.length ?? 0) <= 4;

export function quizMaterial(
  q: { id: string; title: string; difficulty: Difficulty; quizCategory?: QuizCategory },
  solutionMd: string
): QuizMaterial | null {
  const tldr = section(solutionMd, /TL;?DR/i);
  const source = tldr || solutionMd.slice(0, 1500);
  const keyPoints = boldTerms(source).slice(0, 6);
  if (keyPoints.length < 2) return null;
  const firstPara = (tldr || solutionMd)
    .split(/\n\s*\n/)
    .find((p) => !/^(#|```|\|)/.test(p.trim()));
  return {
    kind: 'quiz',
    id: q.id,
    ask: spokenQuestion(q.title),
    title: plainText(q.title),
    difficulty: q.difficulty,
    category: q.quizCategory ?? null,
    keyPoints,
    summary: firstSentence(plainText(firstPara ?? '')),
  };
}

export function behavioralMaterial(
  q: { id: string; title: string },
  promptMd: string
): BehavioralMaterial {
  const quote = promptMd
    .split(/\r?\n/)
    .filter((l) => l.startsWith('>'))
    .map((l) => l.replace(/^>\s?/, ''))
    .join(' ');
  const ask = plainText(quote)
    .replace(/^["“]|["”]$/g, '')
    .trim();
  return {
    kind: 'behavioral',
    id: q.id,
    ask: ask.length > 15 ? ask : `${plainText(q.title)}.`,
    title: plainText(q.title),
    assessing: boldTerms(section(promptMd, /assess/i)).slice(0, 6),
  };
}
