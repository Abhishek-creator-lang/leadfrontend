import type { Difficulty } from '@/content/types';
import * as S from '@/content/interviewer/script';
import type { InterviewRole } from '@/content/interviewer/script';
import { verdict } from '@/utils/mockInterview';
import { gradeAnswer, intentOf, storySignals, wordCount, type Grade } from './classify';
import type { BehavioralMaterial, QuizMaterial } from './material';

/**
 * The live interviewer's brain: a pure state machine. The room (src/views/mock/room) feeds it what
 * the candidate said (or a silence) and speaks the lines it returns. Stages run in order:
 * opening → intro → warm-up fundamentals → behavioral → candidate's questions → closing.
 */

export type Stage = 'opening' | 'intro' | 'warmup' | 'behavioral' | 'questions' | 'done';

export const STAGES: { id: Exclude<Stage, 'done'>; label: string }[] = [
  { id: 'opening', label: 'Welcome' },
  { id: 'intro', label: 'Your intro' },
  { id: 'warmup', label: 'Fundamentals' },
  { id: 'behavioral', label: 'Leadership' },
  { id: 'questions', label: 'Your questions' },
];

export interface Line {
  who: 'interviewer' | 'candidate';
  text: string;
  stage: Stage;
}

export interface InterviewPlan {
  role: InterviewRole;
  warmupCount: number;
  introFollowups: number;
  quiz: QuizMaterial[];
  behavioral: BehavioralMaterial[];
}

type WarmGrade = Grade | 'dontKnow' | 'skipped';

export interface WarmupResult {
  id: string;
  title: string;
  grade: WarmGrade;
  hinted: boolean;
  score: number;
  missing: string[];
}

export interface BehavioralResult {
  id: string;
  title: string;
  score: number;
  notes: string[];
}

interface CurrentQuiz {
  id: string;
  phase: 'ask' | 'probe';
  answers: string[];
  hinted: boolean;
  hintedTerms: string[];
}

export interface EngineState {
  plan: InterviewPlan;
  seed: number;
  stage: Stage;
  /** Waiting for the candidate to speak. */
  awaiting: boolean;
  /** Last question, for "can you repeat that?". */
  lastAsk: string;
  transcript: Line[];
  silences: number;
  hintsAsked: number;
  intro: { answers: string[]; askedMore: boolean; followups: string[] };
  warm: {
    current: CurrentQuiz | null;
    asked: string[];
    level: Difficulty;
    results: WarmupResult[];
  };
  beh: { index: number; probes: string[]; answers: string[]; results: BehavioralResult[] };
  qa: { count: number };
}

export interface Turn {
  state: EngineState;
  /** Interviewer lines to say, in order (already appended to the transcript). */
  say: string[];
}

const LEVELS: Difficulty[] = ['easy', 'medium', 'hard'];
const up = (d: Difficulty) => LEVELS[Math.min(2, LEVELS.indexOf(d) + 1)];
const down = (d: Difficulty) => LEVELS[Math.max(0, LEVELS.indexOf(d) - 1)];

/** Deterministic pick (LCG) so the same seed gives the same interview in tests. */
function pick<T>(s: EngineState, items: readonly T[]): T {
  s.seed = (s.seed * 1103515245 + 12345) % 2147483648;
  return items[s.seed % items.length];
}

const SCORE: Record<WarmGrade, number> = {
  good: 100,
  partial: 60,
  weak: 25,
  dontKnow: 0,
  skipped: 0,
};

export function startInterview(plan: InterviewPlan, seed = 1): Turn {
  const state: EngineState = {
    plan,
    seed,
    stage: 'opening',
    awaiting: false,
    lastAsk: '',
    transcript: [],
    silences: 0,
    hintsAsked: 0,
    intro: { answers: [], askedMore: false, followups: [] },
    warm: {
      current: null,
      asked: [],
      level: plan.role === 'lead' ? 'medium' : 'easy',
      results: [],
    },
    beh: { index: 0, probes: [], answers: [], results: [] },
    qa: { count: 0 },
  };
  const say: string[] = [];
  ask(state, say, ...S.opening(plan.role, plan.behavioral.length));
  return { state, say };
}

/** Says lines; the last one becomes the question to repeat, and the interviewer waits. */
function ask(s: EngineState, say: string[], ...lines: string[]) {
  tell(s, say, ...lines);
  s.lastAsk = lines[lines.length - 1];
  s.awaiting = true;
  s.silences = 0;
}

function tell(s: EngineState, say: string[], ...lines: string[]) {
  for (const text of lines) {
    say.push(text);
    s.transcript.push({ who: 'interviewer', text, stage: s.stage });
  }
}

/** Feeds the candidate's answer (text) or a long silence (null) to the interviewer. */
export function respond(prev: EngineState, input: string | null): Turn {
  const s: EngineState = structuredClone(prev);
  const say: string[] = [];
  if (s.stage === 'done') return { state: s, say };

  if (input === null) {
    onSilence(s, say);
    return { state: s, say };
  }

  const text = input.trim();
  s.transcript.push({ who: 'candidate', text, stage: s.stage });
  s.awaiting = false;
  const intent = intentOf(text);

  if (intent === 'repeat' && s.lastAsk) {
    ask(s, say, S.REPEAT_PREFIX, s.lastAsk);
    return { state: s, say };
  }
  if (intent === 'clarify') {
    const line =
      s.stage === 'warmup'
        ? S.WARMUP_CLARIFY
        : s.stage === 'behavioral'
          ? S.BEHAVIORAL_CLARIFY
          : s.lastAsk;
    ask(s, say, line);
    return { state: s, say };
  }
  if (intent === 'hint') {
    s.hintsAsked++;
    if (s.stage === 'warmup' && s.warm.current) return warmHint(s, say);
    ask(s, say, s.stage === 'behavioral' ? S.BEHAVIORAL_HINT : S.ENCOURAGE_SILENCE);
    return { state: s, say };
  }
  if (intent === 'skip') {
    skipStage(s, say);
    return { state: s, say };
  }

  switch (s.stage) {
    case 'opening':
      s.stage = 'intro';
      ask(s, say, S.INTRO_ASK);
      break;
    case 'intro':
      onIntro(s, say, text);
      break;
    case 'warmup':
      onWarmup(s, say, text, intent === 'dontKnow');
      break;
    case 'behavioral':
      onBehavioral(s, say, text);
      break;
    case 'questions':
      onQuestions(s, say, text, intent === 'dontKnow');
      break;
  }
  return { state: s, say };
}

function onSilence(s: EngineState, say: string[]) {
  s.silences++;
  switch (s.stage) {
    case 'opening':
      s.stage = 'intro';
      ask(s, say, S.INTRO_ASK);
      return;
    case 'warmup':
      if (s.warm.current) {
        s.transcript.push({ who: 'candidate', text: '(no answer)', stage: s.stage });
        onWarmup(s, say, '', true);
      }
      return;
    case 'questions':
      onQuestions(s, say, '', true);
      return;
    default:
      // intro and behavioral: encourage once, then move on
      if (s.silences === 1) {
        ask(s, say, S.ENCOURAGE_SILENCE);
        s.silences = 1; // keep counting: a second silence moves on
      } else skipStage(s, say);
  }
}

function skipStage(s: EngineState, say: string[]) {
  switch (s.stage) {
    case 'opening':
      s.stage = 'intro';
      ask(s, say, S.INTRO_ASK);
      return;
    case 'intro':
      startWarmup(s, say);
      return;
    case 'warmup':
      if (s.warm.current) finishQuiz(s, say, 'skipped', ['No problem, let’s skip that one.']);
      return;
    case 'behavioral':
      finishStory(s, say, ['Okay, let’s leave that one.']);
      return;
    case 'questions':
      close(s, say);
  }
}

// ---- intro ----

function onIntro(s: EngineState, say: string[], text: string) {
  s.intro.answers.push(text);
  const all = s.intro.answers.join(' ');
  if (wordCount(all) < 20 && !s.intro.askedMore) {
    s.intro.askedMore = true;
    ask(s, say, S.INTRO_MORE);
    return;
  }
  if (s.intro.followups.length < s.plan.introFollowups) {
    const isFirst = s.intro.followups.length === 0;
    const f = S.INTRO_FOLLOWUPS.find(
      (x) => !s.intro.followups.includes(x.id) && (isFirst || x.id !== 'proud') && x.when.test(all)
    );
    if (f) {
      s.intro.followups.push(f.id);
      ask(s, say, pick(s, ['Interesting.', 'Got it.', 'Okay, nice.']), f.ask);
      return;
    }
  }
  startWarmup(s, say);
}

// ---- warm-up fundamentals ----

function startWarmup(s: EngineState, say: string[]) {
  s.stage = 'warmup';
  tell(s, say, S.WARMUP_START);
  nextQuiz(s, say, true);
}

const quizById = (s: EngineState, id: string) => s.plan.quiz.find((q) => q.id === id)!;

function nextQuiz(s: EngineState, say: string[], first = false) {
  const left = s.plan.quiz.filter((q) => !s.warm.asked.includes(q.id));
  if (s.warm.results.length >= s.plan.warmupCount || !left.length) {
    startBehavioral(s, say);
    return;
  }
  const last = s.warm.results[s.warm.results.length - 1];
  const lastCategory = last && last.grade === 'good' ? quizById(s, last.id).category : null;
  const byDistance = [...left].sort((a, b) => {
    const d = (q: QuizMaterial) =>
      Math.abs(LEVELS.indexOf(q.difficulty) - LEVELS.indexOf(s.warm.level)) * 2 +
      (lastCategory && q.category !== lastCategory ? 1 : 0);
    return d(a) - d(b);
  });
  const best = byDistance.filter(
    (q, _, arr) => q.difficulty === arr[0].difficulty && q.category === arr[0].category
  );
  const q = pick(s, best);
  s.warm.asked.push(q.id);
  s.warm.current = { id: q.id, phase: 'ask', answers: [], hinted: false, hintedTerms: [] };
  ask(s, say, ...(first ? [q.ask] : [pick(s, S.WARMUP_NEXT), q.ask]));
}

function warmHint(s: EngineState, say: string[]): Turn {
  const cur = s.warm.current!;
  const q = quizById(s, cur.id);
  const { missing } = gradeAnswer(cur.answers.join(' '), q.keyPoints);
  const term = missing.find((m) => !cur.hintedTerms.includes(m));
  cur.hinted = true;
  if (term) {
    cur.hintedTerms.push(term);
    ask(s, say, S.hintFor(term));
  } else {
    ask(s, say, S.WARMUP_CLARIFY);
  }
  return { state: s, say };
}

function onWarmup(s: EngineState, say: string[], text: string, dontKnow: boolean) {
  const cur = s.warm.current;
  if (!cur) return;
  const q = quizById(s, cur.id);
  if (dontKnow) {
    finishQuiz(s, say, 'dontKnow', [pick(s, S.ACK_DONT_KNOW), S.explain(q.summary)]);
    return;
  }
  cur.answers.push(text);
  const { grade, missing } = gradeAnswer(cur.answers.join(' '), q.keyPoints);

  if (cur.phase === 'ask') {
    cur.phase = 'probe';
    if (grade === 'good' && missing.length) {
      ask(s, say, pick(s, S.ACK_GOOD), S.probeMissing(missing[0]));
      return;
    }
    if (grade !== 'good' && missing.length && wordCount(text) >= 3) {
      cur.hinted = true;
      cur.hintedTerms.push(missing[0]);
      ask(s, say, pick(s, S.ACK_PARTIAL), S.hintFor(missing[0]));
      return;
    }
  }
  if (grade === 'good') finishQuiz(s, say, 'good', [pick(s, S.ACK_GOOD)]);
  else
    finishQuiz(s, say, grade, [
      grade === 'partial' ? 'Okay.' : pick(s, S.ACK_DONT_KNOW),
      S.explain(q.summary),
    ]);
}

function finishQuiz(s: EngineState, say: string[], grade: WarmGrade, lines: string[]) {
  const cur = s.warm.current!;
  const q = quizById(s, cur.id);
  const { missing } = gradeAnswer(cur.answers.join(' '), q.keyPoints);
  s.warm.results.push({
    id: q.id,
    title: q.title,
    grade,
    hinted: cur.hinted,
    score: Math.max(0, SCORE[grade] - (cur.hinted && grade !== 'good' ? 15 : cur.hinted ? 10 : 0)),
    missing,
  });
  s.warm.level =
    grade === 'good' ? up(s.warm.level) : grade === 'partial' ? s.warm.level : down(s.warm.level);
  s.warm.current = null;
  tell(s, say, ...lines);
  nextQuiz(s, say);
}

// ---- behavioral ----

function startBehavioral(s: EngineState, say: string[]) {
  if (!s.plan.behavioral.length) {
    startQuestions(s, say);
    return;
  }
  s.stage = 'behavioral';
  s.beh = { ...s.beh, index: 0, probes: [], answers: [] };
  ask(s, say, S.BEHAVIORAL_START, s.plan.behavioral[0].ask);
}

function onBehavioral(s: EngineState, say: string[], text: string) {
  s.beh.answers.push(text);
  const sig = storySignals(s.beh.answers.join(' '));
  const want = (id: keyof typeof S.BEHAVIORAL_PROBES, cond: boolean) =>
    cond && !s.beh.probes.includes(id);
  const probe =
    (want('more', sig.words < 40) && 'more') ||
    (want('ownership', sig.hidesBehindWe) && 'ownership') ||
    (want('result', !sig.hasResult) && 'result') ||
    (want('reflect', !sig.reflects) && 'reflect') ||
    null;
  if (probe && s.beh.probes.length < 2) {
    s.beh.probes.push(probe);
    ask(s, say, pick(s, ['Okay.', 'Right.', 'I see.']), S.BEHAVIORAL_PROBES[probe]);
    return;
  }
  finishStory(s, say, [pick(s, S.ACK_STORY)]);
}

function finishStory(s: EngineState, say: string[], lines: string[]) {
  const m = s.plan.behavioral[s.beh.index];
  const all = s.beh.answers.join(' ');
  const sig = storySignals(all);
  const notes: string[] = [];
  let score = all ? 20 : 0;
  if (all) {
    if (sig.words >= 80) score += 20;
    else notes.push('Give more context: the situation and what was at stake.');
    if (!sig.hidesBehindWe) score += 20;
    else notes.push('Say "I" more: make your own actions clear.');
    if (sig.hasResult) score += 20;
    else notes.push('End with a concrete result, ideally a number.');
    if (sig.reflects) score += 20;
    else notes.push('Add what you learned or would do differently.');
  } else {
    notes.push('Skipped. Prepare a story for this one.');
  }
  s.beh.results.push({ id: m.id, title: m.title, score, notes });
  tell(s, say, ...lines);
  const next = s.beh.index + 1;
  if (next < s.plan.behavioral.length) {
    s.beh = { ...s.beh, index: next, probes: [], answers: [] };
    ask(s, say, S.BEHAVIORAL_NEXT, s.plan.behavioral[next].ask);
  } else {
    startQuestions(s, say);
  }
}

// ---- candidate's questions & close ----

function startQuestions(s: EngineState, say: string[]) {
  s.stage = 'questions';
  ask(s, say, S.QA_ASK);
}

const NO_QUESTIONS =
  /^(no|nope|nothing|none|i'?m good|i am good|that'?s (all|it)|no questions?|not really|all good|i think that'?s it)\b/i;

function onQuestions(s: EngineState, say: string[], text: string, none: boolean) {
  if (none || NO_QUESTIONS.test(text.trim())) {
    if (s.qa.count === 0) tell(s, say, S.QA_NONE);
    close(s, say);
    return;
  }
  s.qa.count++;
  const answer = S.QA_ANSWERS.find((a) => a.when.test(text))!.answer;
  if (s.qa.count >= 2) {
    tell(s, say, answer);
    close(s, say);
  } else {
    ask(s, say, answer, S.QA_MORE);
  }
}

function close(s: EngineState, say: string[]) {
  tell(s, say, ...S.CLOSING);
  s.stage = 'done';
  s.awaiting = false;
}

// ---- report ----

export interface InterviewReport {
  score: number;
  verdict: ReturnType<typeof verdict>;
  stages: { id: string; label: string; score: number | null }[];
  strengths: string[];
  gaps: string[];
  warmup: WarmupResult[];
  behavioral: BehavioralResult[];
  hintsUsed: number;
}

export function buildReport(s: EngineState): InterviewReport {
  const introText = s.intro.answers.join(' ');
  const introWords = wordCount(introText);
  const intro = introWords
    ? 40 +
      (introWords >= 60 ? 20 : 0) +
      (/\b(lead|led|team|built|improv\w*|own\w*|ship\w*|launch\w*|scal\w*)\b/i.test(introText)
        ? 20
        : 0) +
      (introWords <= 300 ? 20 : 0)
    : null;
  const avg = (xs: number[]) =>
    xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null;
  const warm = avg(s.warm.results.map((r) => r.score));
  const beh = avg(s.beh.results.map((r) => r.score));
  const qa = s.stage === 'done' || s.qa.count ? (s.qa.count ? 100 : 40) : null;

  const parts: [number | null, number][] = [
    [intro, 15],
    [warm, 40],
    [beh, 35],
    [qa, 10],
  ];
  const weight = parts.reduce((w, [v, k]) => w + (v === null ? 0 : k), 0);
  const score = weight ? Math.round(parts.reduce((t, [v, k]) => t + (v ?? 0) * k, 0) / weight) : 0;

  const strengths: string[] = [];
  const gaps: string[] = [];
  const good = s.warm.results.filter((r) => r.grade === 'good').length;
  if (good) strengths.push(`Solid on ${good} of ${s.warm.results.length} fundamentals questions.`);
  if (s.beh.results.some((r) => r.score >= 80))
    strengths.push('Clear, structured leadership stories.');
  if (intro !== null && intro >= 80) strengths.push('A concise, relevant introduction.');
  if (s.qa.count) strengths.push('Asked thoughtful questions at the end.');

  for (const r of s.warm.results.filter((x) => x.grade !== 'good'))
    gaps.push(
      `Revisit "${r.title}"${r.missing.length ? `: mention ${r.missing.slice(0, 2).join(' and ')}` : ''}.`
    );
  for (const n of new Set(s.beh.results.flatMap((r) => r.notes))) gaps.push(n);
  if (introWords && introWords < 60)
    gaps.push('Your intro was short. Aim for about a minute: role, scope, one highlight.');
  if (introWords > 300) gaps.push('Your intro ran long. Keep it to about a minute.');
  if (s.stage === 'done' && !s.qa.count)
    gaps.push('Prepare one or two questions for the interviewer.');

  return {
    score,
    verdict: verdict(score),
    stages: [
      { id: 'intro', label: 'Intro', score: intro },
      { id: 'warmup', label: 'Fundamentals', score: warm },
      { id: 'behavioral', label: 'Leadership', score: beh },
      { id: 'questions', label: 'Your questions', score: qa },
    ],
    strengths,
    gaps: gaps.slice(0, 6),
    warmup: s.warm.results,
    behavioral: s.beh.results,
    hintsUsed: s.hintsAsked + s.warm.results.filter((r) => r.hinted).length,
  };
}
