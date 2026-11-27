import { KEY_POINT_ALIASES } from './aliases';

/**
 * Understands what the candidate said: control phrases ("can you repeat that?", "no hint, thanks")
 * and answer-quality signals. Pure and deterministic, so the interviewer behaves the same way for
 * the same answer. Works on speech-recognition text (no punctuation, odd casing).
 */

export type Intent =
  | 'repeat'
  | 'hint'
  | 'skip'
  | 'dontKnow'
  | 'clarify'
  /** "How should I answer this?": asks for the expected shape of an answer, not a hint. */
  | 'howTo'
  /** "Just tell me the answer." */
  | 'revealAnswer'
  /** A short yes. Only meaningful as a reply to something the interviewer offered. */
  | 'affirm'
  /** A short no ("no thanks", "no hint please", "I'm good"). */
  | 'decline'
  | 'answer';

const words = (text: string) => text.toLowerCase().match(/[a-z0-9']+/g) ?? [];

export const wordCount = (text: string) => words(text).length;

const SHORT = 14; // control phrases are short; long answers that mention "hint" are still answers

const NEG = "(?:no|not|don'?t|do not|without|never|stop|no need for)";

const RE = {
  repeat:
    /\b(repeat|say (that|it) again|pardon|come again|didn'?t (catch|hear|get) (that|it|you))\b/,
  /** "no hint", "I don't need a hint", "without hints please" */
  declinedHint: new RegExp(`\\b${NEG}\\b(\\s+[a-z']+){0,3}\\s+(hints?|clues?|help)\\b`),
  dontKnowIdiom: /\bno clue\b|\bclueless\b/,
  howTo:
    /\b(how (should|do|would|can|shall) i (answer|respond|approach|structure|start|tackle)( (this|that|it))?|what (are you|do you|is the interviewer) (looking for|want|expect\w*)|what kind of (answer|response|example)|how (long|detailed|much detail)|(give|show) (me )?an example|what format|where (do|should) i (start|begin))\b/,
  revealAnswer:
    /\b(tell me the answer|(what'?s|what is) the (right |correct |actual )?answer|just tell me|(give|show) me the (answer|solution)|what'?s the solution)\b/,
  clarify:
    /\b(what do you mean|clarify|rephrase|not sure what you'?re (asking|looking for)|not sure what you mean|(don'?t|do not|didn'?t) (understand|get) the question|help me understand|what exactly (do|are) you)\b/,
  hint: /\b(hints?|clue|nudge|help me)\b/,
  noSkip: /\b(don'?t|do not|no need to)\s+(skip|move on|pass)\b/,
  skip: /\b(skip|move on|next question|pass|let'?s move|moving on|go to the next)\b/,
  dontKnow:
    /\b(i )?(don'?t|do not) (know|remember|recall)\b|\bno idea\b|\bnot sure\b|\bnever (used|heard|worked)\b|\bhaven'?t (used|heard|worked)\b|\b(don'?t|do not) have (an?|any) (example|story|experience)\b|\bcan'?t think of (one|an example|anything)\b/,
  affirm:
    /^(yes|yeah|yep|yup|ya|sure|ok|okay|alright|please|go ahead|of course|definitely|i do|yes please|sure thing|why not|i would|i'?d like that)\b/,
  decline:
    /^(no|nope|nah|not now|not really|i'?m (good|fine|okay|ok|alright)|i am (good|fine)|all good|that'?s (all|it|everything)|nothing( else)?|none|no thanks|no thank you|i'?ll pass)\b/,
};

export function intentOf(text: string): Intent {
  const t = text
    .toLowerCase()
    .replace(/[.,!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const n = wordCount(t);
  if (!n) return 'dontKnow';
  if (n > SHORT) return 'answer';
  if (RE.repeat.test(t)) return 'repeat';
  if (RE.dontKnowIdiom.test(t)) return 'dontKnow';
  if (RE.declinedHint.test(t)) return RE.skip.test(t) && !RE.noSkip.test(t) ? 'skip' : 'decline';
  if (RE.howTo.test(t)) return 'howTo';
  if (RE.revealAnswer.test(t)) return 'revealAnswer';
  if (RE.clarify.test(t)) return 'clarify';
  if (RE.hint.test(t)) return 'hint';
  if (RE.skip.test(t) && !RE.noSkip.test(t)) return 'skip';
  if (RE.dontKnow.test(t)) return 'dontKnow';
  if (n <= 5 && RE.affirm.test(t)) return 'affirm';
  if (n <= 6 && RE.decline.test(t)) return 'decline';
  return 'answer';
}

// ---------- key-point matching ----------

/** Lower-case alphanumerics only: "Abort Controller" and "`AbortController`" both → "abortcontroller". */
const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const tokens = (text: string) => text.toLowerCase().match(/[a-z0-9]+/g) ?? [];

/** Words that carry no meaning in a key point. */
const STOP = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'in',
  'into',
  'is',
  'it',
  'its',
  'of',
  'on',
  'or',
  'the',
  'their',
  'this',
  'that',
  'to',
  'vs',
  'via',
  'with',
  'your',
  'you',
]);

const NEGATIONS = new Set([
  'not',
  'no',
  'never',
  'without',
  'dont',
  'doesnt',
  'isnt',
  'arent',
  'cant',
  'cannot',
  'wont',
  'didnt',
  'shouldnt',
  'wasnt',
  'werent',
  'nor',
]);

const stem = (w: string) => {
  const s = w.replace(/(ing|ed|es|s)$/, '');
  return s.length >= 3 ? s : w;
};

/** Same word allowing plurals and tense: "render" ~ "rendering", "class" ~ "classes". */
function sameWord(token: string, word: string): boolean {
  if (token === word) return true;
  const st = stem(token);
  const sw = stem(word);
  if (st === sw) return true;
  // A few letters of suffix only: "render" ~ "rendering", but "abort" is not "aborterror".
  return (
    (sw.length >= 5 && token.startsWith(sw) && token.length - sw.length <= 4) ||
    (st.length >= 5 && word.startsWith(st) && word.length - st.length <= 3)
  );
}

/** How strictly a key point must be covered. */
export type MatchMode =
  /** Every meaningful word, close together (fundamentals: key points are precise terms). */
  | 'strict'
  /** Half the meaningful words, close together (system design: key points are broad topics). */
  | 'loose';

interface Span {
  start: number;
  end: number;
}

/**
 * Where `phrase` occurs in the answer's tokens. `tight` (used for aliases) needs all its words
 * nearly next to each other, so "promise queue" doesn't match "promises … the microtask queue".
 */
function findPhrase(ans: string[], phrase: string, mode: MatchMode, tight = false): Span[] {
  const spans: Span[] = [];
  const key = squash(phrase);
  // 1) Adjacent tokens that spell the key: "abort controller" ↔ AbortController.
  if (key.length >= 2) {
    for (let i = 0; i < ans.length; i++) {
      let joined = '';
      for (let j = i; j < Math.min(ans.length, i + 4); j++) {
        joined += ans[j];
        if (joined === key || (key.length >= 4 && stem(joined) === stem(key))) {
          spans.push({ start: i, end: j });
          break;
        }
        if (joined.length >= key.length + 3) break;
      }
    }
  }
  // 2) Meaningful words close together: "controller dot abort" ↔ controller.abort().
  const kw = [...new Set(tokens(phrase).filter((w) => w.length >= 2 && !STOP.has(w)))];
  if (kw.length) {
    const need = mode === 'strict' || tight ? kw.length : Math.max(1, Math.ceil(kw.length / 2));
    const window = tight ? kw.length + 2 : Math.max(6, kw.length * 2 + 2);
    for (let i = 0; i < ans.length; i++) {
      if (!kw.some((w) => sameWord(ans[i], w))) continue;
      const found = new Set<string>();
      let end = i;
      for (let j = i; j < Math.min(ans.length, i + window); j++) {
        const w = kw.find((k) => !found.has(k) && sameWord(ans[j], k));
        if (w) {
          found.add(w);
          end = j;
        }
      }
      if (found.size >= need) spans.push({ start: i, end });
    }
  }
  return spans;
}

/** Initials of a multi-word term ("Server Side Rendering" → "ssr"), when long enough to be safe. */
function acronym(phrase: string): string | null {
  const kw = tokens(phrase).filter((w) => !STOP.has(w));
  if (kw.length < 3) return null;
  return kw.map((w) => w[0]).join('');
}

/** Forms a key point may take: itself, curated aliases, and its acronym. */
function forms(keyPoint: string): string[] {
  const out = [keyPoint, ...(KEY_POINT_ALIASES[squash(keyPoint)] ?? [])];
  const a = acronym(keyPoint);
  if (a) out.push(a);
  return out;
}

/** Words that start a new clause: a negation before them does not reach past them. */
const CLAUSE = new Set([
  'but',
  'because',
  'which',
  'while',
  'although',
  'though',
  'so',
  'whereas',
  'then',
]);

/**
 * Tokens of an answer, plus where clauses break (punctuation). Apostrophes are dropped so
 * "don't" → "dont".
 */
function answerTokens(answer: string): { ans: string[]; breakBefore: Set<number> } {
  const ans: string[] = [];
  const breakBefore = new Set<number>();
  for (const m of answer
    .toLowerCase()
    .replace(/'/g, '')
    .matchAll(/[a-z0-9]+|[,.;:!?()]/g)) {
    if (/^[a-z0-9]/.test(m[0])) ans.push(m[0]);
    else breakBefore.add(ans.length);
  }
  return { ans, breakBefore };
}

/** A negation up to 5 words before, in the same clause ("do not go through the microtask queue"). */
function negated(ans: string[], breakBefore: Set<number>, start: number): boolean {
  for (let j = start - 1; j >= Math.max(0, start - 5); j--) {
    if (breakBefore.has(j + 1) || CLAUSE.has(ans[j])) return false;
    if (NEGATIONS.has(ans[j]) && !/^(only|just)$/.test(ans[j + 1] ?? '')) return true;
  }
  return false;
}

export interface KeyPointMatch {
  /** Covered: mentioned at least once without a negation in front of it. */
  hit: boolean;
  /** Only ever mentioned negated ("it is not asynchronous"). */
  contradicted: boolean;
  /** The words of the answer that matched, for the report. */
  phrase: string;
}

export function matchKeyPoint(
  answer: string,
  keyPoint: string,
  mode: MatchMode = 'strict'
): KeyPointMatch {
  const { ans, breakBefore } = answerTokens(answer);
  let negatedPhrase = '';
  for (const [i, form] of forms(keyPoint).entries()) {
    for (const span of findPhrase(ans, form, mode, i > 0)) {
      const phrase = ans.slice(span.start, span.end + 1).join(' ');
      if (!negated(ans, breakBefore, span.start)) return { hit: true, contradicted: false, phrase };
      negatedPhrase ||= ans.slice(Math.max(0, span.start - 5), span.end + 1).join(' ');
    }
  }
  return negatedPhrase
    ? { hit: false, contradicted: true, phrase: negatedPhrase }
    : { hit: false, contradicted: false, phrase: '' };
}

/** True when the answer covers a key point (not only negated). */
export const mentions = (answer: string, keyPoint: string, mode: MatchMode = 'strict') =>
  matchKeyPoint(answer, keyPoint, mode).hit;

export interface Coverage {
  hit: string[];
  missing: string[];
  /** Key points only mentioned negated: likely a misconception. Also listed in `missing`. */
  contradicted: string[];
  /** Key point → the words that matched it. */
  matched: Record<string, string>;
  ratio: number;
}

export function coverage(
  answer: string,
  keyPoints: string[],
  mode: MatchMode = 'strict'
): Coverage {
  const hit: string[] = [];
  const missing: string[] = [];
  const contradicted: string[] = [];
  const matched: Record<string, string> = {};
  for (const k of keyPoints) {
    const m = matchKeyPoint(answer, k, mode);
    if (m.hit) {
      hit.push(k);
      matched[k] = m.phrase;
    } else {
      missing.push(k);
      if (m.contradicted) contradicted.push(k);
    }
  }
  return {
    hit,
    missing,
    contradicted,
    matched,
    ratio: keyPoints.length ? hit.length / keyPoints.length : 0,
  };
}

/** The answer says something relevant: it covers at least one key point. */
export const hasSubstance = (answer: string, keyPoints: string[]) =>
  keyPoints.some((k) => mentions(answer, k));

export type Grade = 'good' | 'partial' | 'weak';

export interface GradeDetail extends Coverage {
  grade: Grade;
  /** The answer is little more than a list of terms. */
  listLike: boolean;
}

const LEVEL: Grade[] = ['weak', 'partial', 'good'];
export const gradeDown = (g: Grade): Grade => LEVEL[Math.max(0, LEVEL.indexOf(g) - 1)];
export const gradeUp = (g: Grade): Grade => LEVEL[Math.min(2, LEVEL.indexOf(g) + 1)];

/**
 * Grades a fundamentals answer by which key points it covers. Length alone earns nothing, a bare
 * list of terms is at most partial, and a negated key point ("it's not asynchronous") costs a level.
 */
export function gradeAnswer(answer: string, keyPoints: string[]): GradeDetail {
  const c = coverage(answer, keyPoints, 'strict');
  const n = wordCount(answer);
  const keyWords = new Set(Object.values(c.matched).flatMap((p) => p.split(' '))).size;
  const listLike = c.hit.length >= 2 && n - keyWords < c.hit.length;
  let grade: Grade =
    c.ratio >= 0.5 || (c.ratio >= 0.34 && n >= 25) ? 'good' : c.hit.length ? 'partial' : 'weak';
  if (grade === 'good' && listLike) grade = 'partial';
  if (c.contradicted.length) grade = gradeDown(grade);
  return { ...c, grade, listLike };
}

/** What Chrome's on-device model thinks of a fundamentals answer (see src/lib/aiGrade.ts). */
export interface AIJudgement {
  /** Key points it considers covered, including paraphrases the keyword check missed. */
  covered: string[];
  /** Statements in the answer it considers wrong. */
  incorrect: string[];
  verdict: 'correct' | 'partial' | 'incorrect';
}

export interface CombinedGrade extends GradeDetail {
  /** Key points only the on-device model found (paraphrases). */
  aiCovered: string[];
  incorrect: string[];
}

/**
 * Combines the keyword grade with the on-device model's opinion. The model can move the grade by
 * one level at most, and only with evidence: down when it names a wrong statement, up when it names
 * key points the keyword check missed. Anything it says about unknown key points is ignored.
 */
export function combineWithAI(g: GradeDetail, ai: AIJudgement, keyPoints: string[]): CombinedGrade {
  const known = new Map(keyPoints.map((k) => [k.toLowerCase(), k]));
  const covered = ai.covered
    .map((c) => known.get(c.toLowerCase().trim()))
    .filter((k): k is string => Boolean(k));
  const aiCovered = covered.filter((k) => !g.hit.includes(k) && !g.contradicted.includes(k));
  const incorrect =
    ai.verdict === 'correct' ? [] : ai.incorrect.filter((x) => x.trim()).slice(0, 3);
  const hit = [...g.hit, ...aiCovered];
  const matched = { ...g.matched };
  for (const k of aiCovered) matched[k] = '(paraphrase, checked on-device)';
  let grade = g.grade;
  if (incorrect.length) grade = gradeDown(g.grade);
  else if (aiCovered.length && ai.verdict !== 'incorrect') {
    const ratio = keyPoints.length ? hit.length / keyPoints.length : 0;
    const target: Grade = ratio >= 0.5 && !g.listLike ? 'good' : hit.length ? 'partial' : 'weak';
    if (LEVEL.indexOf(target) > LEVEL.indexOf(grade)) grade = gradeUp(grade);
  }
  return {
    ...g,
    grade,
    hit,
    missing: keyPoints.filter((k) => !hit.includes(k)),
    matched,
    ratio: keyPoints.length ? hit.length / keyPoints.length : 0,
    aiCovered,
    incorrect,
  };
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

/** Sounds like a question (clarifying question, not an answer or thinking out loud). */
export function isQuestion(text: string): boolean {
  const t = text.trim();
  if (/\?\s*$/.test(t)) return true;
  // Long lines starting with "if" or "is" are usually thinking out loud ("if the index is negative…").
  if (wordCount(t) > 12 && /^(if|is|did)\b/i.test(t)) return false;
  return /^(what|how|can|could|should|do|does|did|is|are|will|would|may|which|when|where|why|if)\b/i.test(
    t
  );
}

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
