/**
 * Understands what the candidate said: control phrases ("can you repeat that?", "hint please")
 * and simple answer-quality signals. Pure and deterministic, so the interviewer behaves the same
 * way for the same answer. Works on speech-recognition text (no punctuation, odd casing).
 */

export type Intent = 'repeat' | 'hint' | 'skip' | 'dontKnow' | 'clarify' | 'answer';

const words = (text: string) => text.toLowerCase().match(/[a-z0-9']+/g) ?? [];

export const wordCount = (text: string) => words(text).length;

const SHORT = 14; // control phrases are short; long answers that mention "hint" are still answers

export function intentOf(text: string): Intent {
  const t = text.toLowerCase().trim();
  const n = wordCount(t);
  if (!n) return 'dontKnow';
  if (n <= SHORT) {
    if (
      /\b(repeat|say (that|it) again|pardon|come again|didn'?t (catch|hear|get) (that|it|you))\b/.test(
        t
      )
    )
      return 'repeat';
    if (/\b(hint|clue|nudge|help me)\b/.test(t)) return 'hint';
    if (/\b(skip|move on|next question|pass|let'?s move)\b/.test(t)) return 'skip';
    if (/\b(what do you mean|clarify|rephrase|not sure what you'?re asking)\b/.test(t))
      return 'clarify';
    if (
      /\b(i )?(don'?t|do not) (know|remember|recall)\b|\bno idea\b|\bnot sure\b|\bnever (used|heard|worked)\b|\bhaven'?t (used|heard|worked)\b/.test(
        t
      )
    )
      return 'dontKnow';
  }
  return 'answer';
}

/** Lower-case alphanumerics only: "Abort Controller" and "`AbortController`" both → "abortcontroller". */
const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** True when the answer mentions a key point (exact squashed match, or most of its long words). */
export function mentions(answer: string, keyPoint: string): boolean {
  const a = squash(answer);
  const k = squash(keyPoint);
  if (k.length >= 3 && a.includes(k)) return true;
  const kw = words(keyPoint).filter((w) => w.length > 3);
  if (!kw.length) return false;
  const hits = kw.filter((w) => a.includes(squash(w.replace(/(ing|ed|es|s)$/, '')))).length;
  return hits / kw.length >= 0.6;
}

export const coverage = (answer: string, keyPoints: string[]) => {
  const hit = keyPoints.filter((k) => mentions(answer, k));
  return {
    hit,
    missing: keyPoints.filter((k) => !hit.includes(k)),
    ratio: keyPoints.length ? hit.length / keyPoints.length : 0,
  };
};

export type Grade = 'good' | 'partial' | 'weak';

export function gradeAnswer(
  answer: string,
  keyPoints: string[]
): { grade: Grade; missing: string[] } {
  const { ratio, missing } = coverage(answer, keyPoints);
  const n = wordCount(answer);
  if (ratio >= 0.5 || (ratio >= 0.34 && n >= 25)) return { grade: 'good', missing };
  if (ratio > 0 || n >= 30) return { grade: 'partial', missing };
  return { grade: 'weak', missing };
}

/** Behavioral answer signals used to choose probes and to score. */
export function storySignals(answer: string) {
  const w = words(answer);
  const count = (re: RegExp) => w.filter((x) => re.test(x)).length;
  const i = count(/^(i|i'm|i've|i'd|my|me|myself)$/);
  const we = count(/^(we|we're|we've|we'd|our|us)$/);
  return {
    words: w.length,
    /** "we" dominates and "I" is rare: interviewers ask what *you* did. */
    hidesBehindWe: we >= 3 && we > i * 2,
    hasResult:
      /\b(\d+ ?(%|percent|ms|seconds?|x|times|users|hours|days|weeks)|result(ed)?|outcome|reduced|increased|improved|cut|saved|shipped|launched|grew|dropped)\b/i.test(
        answer
      ),
    reflects:
      /\b(learn(ed|t)?|differently|next time|in hindsight|looking back|lesson|changed how|now i)\b/i.test(
        answer
      ),
  };
}

/** Spoken forms of common Big-O classes ("O of n", "linear"…), keyed by squashed notation. */
const COMPLEXITY_WORDS: [RegExp, RegExp][] = [
  [/^o1$/, /\b(o\s*\(?\s*(1|one)\s*\)?|o of (1|one)|constant)\b/],
  [/^ologn$/, /\b(log\s*n|logarithmic|login)\b/],
  [/^on$/, /\b(o\s*\(\s*n\s*\)|o of n|big o n|linear)\b/],
  [/^onlogn$/, /\b(n\s*log\s*n|n login|linearithmic)\b/],
  [/^on(\^2|2|²)$/, /\b(n\s*(squared|\^\s*2|²)|quadratic)\b/],
  [/^on\*m$|^onm$|^on\+m$/, /\b(n\s*(times|plus|\+|\*)\s*m|n and m)\b/],
];

/** True when a spoken answer names at least one of the expected Big-O terms. */
export function mentionsComplexity(answer: string, terms: string[]): boolean {
  const a = answer.toLowerCase();
  return terms.some((term) => {
    const key = term.toLowerCase().replace(/[\s()]/g, '');
    const match = COMPLEXITY_WORDS.find(([k]) => k.test(key));
    if (match && match[1].test(a)) return true;
    return a.replace(/\s/g, '').includes(term.toLowerCase().replace(/\s/g, ''));
  });
}

/** Sounds like a question (clarifying question, not an answer). */
export const isQuestion = (text: string) =>
  /\?\s*$/.test(text.trim()) ||
  /^(what|how|can|could|should|do|does|did|is|are|will|would|may|which|when|where|why|if)\b/i.test(
    text.trim()
  );

/** Best-matching requirement for a clarifying question (most shared meaningful words), or null. */
export function answerFromRequirements(question: string, requirements: string[]): string | null {
  const stop = new Set([
    'what',
    'about',
    'should',
    'would',
    'could',
    'there',
    'their',
    'which',
    'when',
    'with',
    'that',
    'this',
    'does',
    'have',
    'will',
    'from',
    'into',
  ]);
  const qWords = new Set(words(question).filter((w) => w.length > 3 && !stop.has(w)));
  let best: { r: string; score: number } | null = null;
  for (const r of requirements) {
    const score = words(r).filter((w) => qWords.has(w)).length;
    if (score > 0 && (!best || score > best.score)) best = { r, score };
  }
  return best?.r ?? null;
}
