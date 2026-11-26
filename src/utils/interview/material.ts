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
// CodingMaterial is loaded separately (see loadCodingQuestionAction).

/** Markdown → plain spoken text: no code ticks, emphasis, links or extra spaces. */
export function plainText(md: string): string {
  return (
    md
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/<\/?([a-zA-Z][\w-]*)[^>]*>/g, '$1')
      // `_` stays: it is part of identifiers like MAX_SAFE_INTEGER (the content uses ** for emphasis).
      .replace(/[`*>#]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
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

// ---- coding round ----

export interface CodingMaterial {
  kind: 'coding';
  id: string;
  title: string;
  format: 'javascript' | 'algorithms' | 'user-interface';
  difficulty: Difficulty;
  /** Prompt shown on screen (Markdown), without its follow-up section. */
  prompt: string;
  /** One sentence the interviewer says to introduce the problem. */
  intro: string;
  /** Sandpack files: starter code and tests only, never the solution. */
  files: Record<string, string>;
  /** Hint ladder from the solution's Approach: general first, more specific later. */
  hints: string[];
  /** Answers to clarifying questions, from the prompt's Requirements. */
  requirements: string[];
  /** Expected complexity, said if the candidate gets it wrong. */
  complexity: string;
  /** Big-O terms from the Complexity section, e.g. ["O(n)", "O(1)"]. */
  complexityTerms: string[];
  /** Edge cases worth probing. */
  edgeCases: string[];
  /** Follow-up questions or twists. */
  followUps: string[];
}

const bullets = (md: string) =>
  md
    .split(/\r?\n/)
    .filter((l) => /^\s*(?:[-*]|\d+\.)\s+/.test(l))
    .map((l) => plainText(l.replace(/^\s*(?:[-*]|\d+\.)\s+/, '')))
    .filter(Boolean);

const clip = (text: string, max = 220) =>
  text.length > max ? `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…` : text;

/** Removes `## Follow-up(s)` sections (they are the interviewer's questions, not the candidate's). */
export function withoutFollowUps(md: string): string {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let skipping = false;
  for (const l of lines) {
    if (/^##\s/.test(l)) skipping = /^##\s+follow-?ups?\b/i.test(l);
    if (!skipping) out.push(l);
  }
  return out.join('\n').trim();
}

export function codingMaterial(
  q: { id: string; title: string; format: string; difficulty: Difficulty },
  files: Record<string, string>
): CodingMaterial | null {
  if (q.format !== 'javascript' && q.format !== 'algorithms' && q.format !== 'user-interface')
    return null;
  const sandpack: Record<string, string> = {};
  for (const [name, code] of Object.entries(files)) {
    if (name.startsWith('starter/')) sandpack[`/${name.slice('starter/'.length)}`] = code;
    else if (/\.test\.jsx?$/.test(name)) sandpack[`/${name}`] = code;
  }
  const hasStarter = Object.keys(sandpack).some((f) => !/\.test\.jsx?$/.test(f));
  const hasTests = Object.keys(sandpack).some((f) => /\.test\.jsx?$/.test(f));
  if (!hasStarter || !hasTests) return null;

  const promptMd = files['prompt.md'] ?? '';
  const solutionMd = files['solution.md'] ?? '';
  const approach = section(solutionMd, /approach/i);
  const approachIntro =
    approach.split(/\n\s*\n/).find((p) => p.trim() && !/^\s*(\d+\.|[-*])\s/.test(p)) ?? '';
  const hints = [approachIntro && firstSentence(plainText(approachIntro)), ...bullets(approach)]
    .filter(Boolean)
    .map((h) => clip(h))
    .slice(0, 3);

  const complexitySection = plainText(section(solutionMd, /complexity/i));
  const promptFollowUps = bullets(section(promptMd, /follow-?ups?/i)).filter((b) => /\?$/.test(b));
  const solutionFollowUps = boldTerms(section(solutionMd, /follow-?ups?/i)).map(
    (t) => `How would you approach ${t.charAt(0).toLowerCase()}${t.slice(1)}?`
  );
  const firstPromptPara =
    promptMd.split(/\n\s*\n/).find((p) => p.trim() && !/^(#|```|\||>)/.test(p.trim())) ?? '';

  return {
    kind: 'coding',
    id: q.id,
    title: plainText(q.title),
    format: q.format,
    difficulty: q.difficulty,
    prompt: withoutFollowUps(promptMd),
    intro: clip(firstSentence(plainText(firstPromptPara)), 240),
    files: sandpack,
    hints,
    requirements: bullets(section(promptMd, /requirements?|constraints?|rules/i)).slice(0, 10),
    complexity: clip(firstSentence(complexitySection), 200),
    complexityTerms: [...new Set(complexitySection.match(/O\([^)]*\)/g) ?? [])],
    edgeCases: boldTerms(section(solutionMd, /edge cases?/i)).slice(0, 4),
    // The prompt's own follow-up questions read naturally; bold terms are only a fallback.
    followUps: (promptFollowUps.length ? promptFollowUps : solutionFollowUps).slice(0, 3),
  };
}
