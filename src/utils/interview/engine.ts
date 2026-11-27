import type { Difficulty } from '@/content/types';
import * as S from '@/content/interviewer/script';
import type { InterviewRole } from '@/content/interviewer/script';
import { INCOMPLETE, verdict, type Verdict } from './format';
import {
  answerFromRequirements,
  combineWithAI,
  coverage,
  gradeAnswer,
  hasSubstance,
  intentOf,
  isQuestion,
  mentionsComplexity,
  storySignals,
  wordCount,
  type AIJudgement,
  type Grade,
  type Intent,
} from './classify';
import type { BehavioralMaterial, CodingMaterial, DesignMaterial, QuizMaterial } from './material';

/**
 * The live interviewer's brain: a pure state machine. The room (src/views/mock/room) feeds it what
 * the candidate said (or a silence) and speaks the lines it returns. Stages run in order:
 * opening → intro → warm-up fundamentals → coding → system design → behavioral → candidate's
 * questions → closing. The coding and design rounds also react to events from the room (tests run,
 * idle, time, "next step"): see roundEvent.
 *
 * Rules the interviewer keeps:
 * - Hints only when the candidate asks (or says yes to an offer). A "no" is respected.
 * - Short replies ("yes", "no thanks") are read against what the interviewer just asked (`expect`).
 * - Moving on, saying "I don't know" or going quiet after a partial answer keeps the credit earned.
 */

export type Stage =
  'opening' | 'intro' | 'warmup' | 'coding' | 'design' | 'behavioral' | 'questions' | 'done';

export const STAGES: { id: Exclude<Stage, 'done'>; label: string }[] = [
  { id: 'opening', label: 'Welcome' },
  { id: 'intro', label: 'Your intro' },
  { id: 'warmup', label: 'Fundamentals' },
  { id: 'coding', label: 'Coding' },
  { id: 'design', label: 'System design' },
  { id: 'behavioral', label: 'Leadership' },
  { id: 'questions', label: 'Your questions' },
];

const ORDER: Stage[] = [
  'opening',
  'intro',
  'warmup',
  'coding',
  'design',
  'behavioral',
  'questions',
  'done',
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
  /** The coding problem, or null for an interview without a coding round. */
  coding: CodingMaterial | null;
  /** The system design problem, or null for an interview without a design round. */
  design: DesignMaterial | null;
}

/** What a short reply ("yes", "no thanks") answers: the interviewer's last offer or question. */
export type Expect =
  /** "Would you like a hint?" (coding) */
  | 'hintOffer'
  /** "Do you want to keep going, or walk me through what you have?" (coding) */
  | 'keepGoingOrWalkthrough'
  /** "Do you have any questions?" (coding clarify, and the questions at the end) */
  | 'haveQuestions'
  /** "Anything else you'd add?" after a fundamentals answer */
  | 'anythingElse'
  /** "Want to try a similar story, or move on?" (behavioral) */
  | 'noStory';

/** One line of "how this was scored". Penalties have max 0 and negative points. */
export interface BreakdownItem {
  label: string;
  points: number;
  max: number;
}

/** Advice with the points it cost inside its round (0–100). */
export interface Note {
  text: string;
  lost: number;
}

/** 0–100 from a breakdown: points earned over points available. */
export function stageScore(items: BreakdownItem[]): number {
  const max = items.reduce((t, x) => t + x.max, 0);
  if (!max) return 0;
  const pts = items.reduce((t, x) => t + x.points, 0);
  return Math.max(0, Math.min(100, Math.round((pts / max) * 100)));
}

type WarmGrade = Grade | 'dontKnow' | 'skipped';

export type CheckedBy = 'keywords' | 'keywords+ai';

export interface WarmupResult {
  id: string;
  title: string;
  grade: WarmGrade;
  /** The candidate asked for at least one hint. */
  hinted: boolean;
  /** Hints the candidate asked for. */
  hints: number;
  score: number;
  /** Key points covered, missed, and only mentioned negated. */
  hit: string[];
  missing: string[];
  contradicted: string[];
  /** Key point → words of the answer that matched it. */
  matched: Record<string, string>;
  /** Statements the on-device model flagged as wrong. */
  incorrect: string[];
  /** Everything the candidate said for this question. */
  answer: string;
  /** The model short answer. */
  summary: string;
  checkedBy: CheckedBy;
}

export interface CodingResult {
  id: string;
  title: string;
  passed: number;
  total: number;
  hints: number;
  clarifications: number;
  thinkAloud: number;
  complexityCorrect: boolean;
  edgeAnswered: boolean;
  timedOut: boolean;
  skipped: boolean;
  score: number;
  breakdown: BreakdownItem[];
  notes: Note[];
}

export interface DesignStepResult {
  id: string;
  label: string;
  grade: Grade;
  hit: string[];
  missing: string[];
  /** What was said and written for this step. */
  answer: string;
  notes: string;
  /** False for steps the interview never got to (time ran out or it ended). */
  reached: boolean;
}

export interface DesignResult {
  id: string;
  title: string;
  steps: DesignStepResult[];
  pushbacks: { q: string; good: boolean; answer: string }[];
  leadAnswered: boolean | null;
  timedOut: boolean;
  hints: number;
  score: number;
  breakdown: BreakdownItem[];
  notes: Note[];
}

interface DesignState {
  phase: 'steps' | 'pushback' | 'lead';
  stepIndex: number;
  probed: boolean;
  answers: string[];
  steps: DesignStepResult[];
  pushIndex: number;
  /** How many pushback questions to ask (more for lead roles). */
  pushLimit: number;
  pushbacks: { q: string; good: boolean; answer: string }[];
  leadAnswered: boolean | null;
  timedOut: boolean;
  warnedTime: boolean;
  hints: number;
  result: DesignResult | null;
}

export type CodingPhase = 'clarify' | 'coding' | 'followups';

interface CodingState {
  phase: CodingPhase;
  clarifications: number;
  hintIndex: number;
  thinkAloud: number;
  tests: { passed: number; total: number } | null;
  runs: number;
  nudges: number;
  warnedTime: boolean;
  offeredHint: boolean;
  askedRun: boolean;
  confirmedDone: boolean;
  timedOut: boolean;
  solvedEarly: boolean;
  questions: { kind: 'walkthrough' | 'complexity' | 'edge' | 'twist'; ask: string }[];
  qIndex: number;
  complexityCorrect: boolean;
  edgeAnswered: boolean;
  result: CodingResult | null;
}

/** Things that happen in the room during the coding and design rounds. */
export type RoundEvent =
  | { type: 'tests'; passed: number; total: number; elapsedRatio: number }
  | { type: 'idle' }
  | { type: 'timeWarning'; minutesLeft: number }
  | { type: 'timeUp' }
  /** Coding: "I'm done coding". Design: "next step", with the notes written for the current step. */
  | { type: 'done'; notes?: string };

/** @deprecated use RoundEvent */
export type CodingEvent = RoundEvent;

/** Extra input for an answer: design-board notes and on-device AI help. */
export interface AnswerExtras {
  /** Notes the candidate wrote for the current design step (graded with the spoken answer). */
  notes?: string;
  /** A follow-up written by Chrome's built-in AI, used instead of the scripted probe. */
  aiFollowUp?: string;
  /** Chrome's built-in AI's opinion of a fundamentals answer (all answers so far). */
  aiJudgement?: AIJudgement;
}

export interface StorySignals {
  detail: boolean;
  ownership: boolean;
  result: boolean;
  reflection: boolean;
}

export interface BehavioralResult {
  id: string;
  title: string;
  score: number;
  answer: string;
  hints: number;
  /** The candidate said they had no example. */
  noStory: boolean;
  signals: StorySignals;
  breakdown: BreakdownItem[];
  notes: Note[];
}

interface CurrentQuiz {
  id: string;
  phase: 'ask' | 'probe';
  answers: string[];
  /** Hints the candidate asked for. */
  hints: number;
  hintedTerms: string[];
  clarifies: number;
  ai?: AIJudgement;
}

export interface EngineState {
  plan: InterviewPlan;
  seed: number;
  stage: Stage;
  /** Waiting for the candidate to speak. */
  awaiting: boolean;
  /** Last question, for "can you repeat that?". */
  lastAsk: string;
  /** What a short "yes"/"no" would answer right now. */
  expect: Expect | null;
  transcript: Line[];
  silences: number;
  hintsAsked: number;
  /** Rounds the candidate skipped as a whole. */
  skipped: Stage[];
  /** The candidate ended the interview before the closing. */
  endedEarly: boolean;
  endedDuring: Stage | null;
  intro: { answers: string[]; askedMore: boolean; followups: string[] };
  warm: {
    current: CurrentQuiz | null;
    asked: string[];
    level: Difficulty;
    results: WarmupResult[];
  };
  beh: {
    index: number;
    probes: string[];
    answers: string[];
    hints: number;
    results: BehavioralResult[];
  };
  coding: CodingState;
  design: DesignState;
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

/** Points a requested hint costs on a fundamentals question (at most two count). */
const WARM_HINT_COST = 10;

export function startInterview(plan: InterviewPlan, seed = 1): Turn {
  const state: EngineState = {
    plan,
    seed,
    stage: 'opening',
    awaiting: false,
    lastAsk: '',
    expect: null,
    transcript: [],
    silences: 0,
    hintsAsked: 0,
    skipped: [],
    endedEarly: false,
    endedDuring: null,
    intro: { answers: [], askedMore: false, followups: [] },
    warm: {
      current: null,
      asked: [],
      level: plan.role === 'lead' ? 'medium' : 'easy',
      results: [],
    },
    beh: { index: 0, probes: [], answers: [], hints: 0, results: [] },
    coding: {
      phase: 'clarify',
      clarifications: 0,
      hintIndex: 0,
      thinkAloud: 0,
      tests: null,
      runs: 0,
      nudges: 0,
      warnedTime: false,
      offeredHint: false,
      askedRun: false,
      confirmedDone: false,
      timedOut: false,
      solvedEarly: false,
      questions: [],
      qIndex: 0,
      complexityCorrect: false,
      edgeAnswered: false,
      result: null,
    },
    design: {
      phase: 'steps',
      stepIndex: 0,
      probed: false,
      answers: [],
      steps: [],
      pushIndex: 0,
      pushLimit: 0,
      pushbacks: [],
      leadAnswered: null,
      timedOut: false,
      warnedTime: false,
      hints: 0,
      result: null,
    },
    qa: { count: 0 },
  };
  const say: string[] = [];
  ask(
    state,
    say,
    ...S.opening(plan.role, plan.behavioral.length, Boolean(plan.coding), Boolean(plan.design))
  );
  return { state, say };
}

/** Says lines; the last one becomes the question to repeat, and the interviewer waits. */
function ask(s: EngineState, say: string[], ...lines: string[]) {
  tell(s, say, ...lines);
  s.lastAsk = lines[lines.length - 1];
  s.awaiting = true;
  s.silences = 0;
}

/** Like ask, and a short yes/no reply is read as an answer to this question. */
function askExpect(s: EngineState, say: string[], expect: Expect, ...lines: string[]) {
  ask(s, say, ...lines);
  s.expect = expect;
}

function tell(s: EngineState, say: string[], ...lines: string[]) {
  s.expect = null;
  for (const text of lines) {
    say.push(text);
    s.transcript.push({ who: 'interviewer', text, stage: s.stage });
  }
}

/** Feeds the candidate's answer (text) or a long silence (null) to the interviewer. */
export function respond(prev: EngineState, input: string | null, extras: AnswerExtras = {}): Turn {
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
  let intent = intentOf(text);
  const pending = s.expect;
  s.expect = null;

  if (intent === 'repeat' && s.lastAsk) {
    ask(s, say, S.REPEAT_PREFIX, s.lastAsk);
    s.expect = pending;
    return { state: s, say };
  }
  if (intent === 'howTo') {
    howToAnswer(s, say);
    s.expect = pending;
    return { state: s, say };
  }

  const cur = s.stage === 'warmup' ? s.warm.current : null;
  if (cur) {
    // "Not sure, but maybe it's the event loop": an answer, not a "don't know".
    if (intent === 'dontKnow' && hasSubstance(text, quizById(s, cur.id).keyPoints))
      intent = 'answer';
    if (extras.aiJudgement) cur.ai = extras.aiJudgement;
  }

  if (pending && onExpect(s, say, pending, text, intent)) return { state: s, say };

  if (s.stage === 'coding') {
    onCoding(s, say, text, intent);
    return { state: s, say };
  }
  if (s.stage === 'design') {
    onDesign(s, say, text, intent, extras);
    return { state: s, say };
  }
  if (intent === 'clarify') {
    if (cur) {
      cur.clarifies++;
      const q = quizById(s, cur.id);
      ask(s, say, cur.clarifies >= 2 ? S.warmupRephrase(q.title) : S.WARMUP_CLARIFY);
    } else {
      ask(s, say, s.stage === 'behavioral' ? S.BEHAVIORAL_CLARIFY : s.lastAsk);
    }
    s.expect = pending;
    return { state: s, say };
  }
  if (intent === 'hint') {
    s.hintsAsked++;
    if (cur) {
      warmHint(s, say);
    } else if (s.stage === 'behavioral') {
      s.beh.hints++;
      ask(s, say, S.BEHAVIORAL_HINT);
    } else {
      ask(s, say, S.ENCOURAGE_SILENCE);
    }
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
      onWarmup(s, say, text, intent);
      break;
    case 'behavioral':
      onBehavioral(s, say, text, intent);
      break;
    case 'questions':
      onQuestions(s, say, text, intent === 'dontKnow' || intent === 'decline');
      break;
  }
  return { state: s, say };
}

/** "How should I answer this?": the shape of a good answer, then the question again. */
function howToAnswer(s: EngineState, say: string[]) {
  const key = s.stage === 'opening' || s.stage === 'done' ? 'intro' : s.stage;
  const line = S.HOW_TO_ANSWER[key];
  const quietCoding = s.stage === 'coding' && s.coding.phase === 'coding';
  const again = !quietCoding && s.lastAsk && s.lastAsk !== line ? [s.lastAsk] : [];
  ask(s, say, line, ...again);
}

/** Reads a reply against what the interviewer just asked. True when it was handled. */
function onExpect(
  s: EngineState,
  say: string[],
  exp: Expect,
  text: string,
  intent: Intent
): boolean {
  switch (exp) {
    case 'hintOffer':
      if (s.stage !== 'coding') return false;
      if (intent === 'affirm' || intent === 'hint') {
        s.hintsAsked++;
        codingHint(s, say);
        return true;
      }
      if (intent === 'decline') {
        ask(s, say, S.HINT_DECLINED);
        return true;
      }
      return false;

    case 'keepGoingOrWalkthrough':
      if (s.stage !== 'coding' || s.coding.phase !== 'coding') return false;
      if (/\b(walk|wrap|explain|done|finish\w*|stop|enough|what i have)\b/i.test(text)) {
        startCodingFollowups(s, say, [], true);
        return true;
      }
      if (/\b(keep|continue|more time|try|fix|go on|let me)\b/i.test(text) || intent === 'affirm') {
        ask(s, say, S.CODING_KEEP_GOING);
        return true;
      }
      if (intent === 'decline') {
        startCodingFollowups(s, say, [], true);
        return true;
      }
      return false;

    case 'haveQuestions': {
      if (s.stage === 'coding' && s.coding.phase === 'clarify') {
        const ready =
          intent === 'decline' ||
          /\b(ready|let'?s (go|start|begin|code|do it)|start coding|good to go|no questions?|all clear|makes sense)\b/i.test(
            text
          ) ||
          (wordCount(text) <= 3 &&
            /^(ok(ay)?|alright|sounds good|cool|great|got it)\b/i.test(text));
        if (ready) {
          startCodingPhase(s, say);
          return true;
        }
        if (intent === 'affirm') {
          askExpect(s, say, 'haveQuestions', S.GO_AHEAD);
          return true;
        }
        return false;
      }
      if (s.stage === 'questions' && intent === 'affirm') {
        askExpect(s, say, 'haveQuestions', S.GO_AHEAD);
        return true;
      }
      return false;
    }

    case 'anythingElse': {
      if (!s.warm.current) return false;
      if (intent === 'decline' || intent === 'affirm') {
        concludeQuiz(s, say, 'answered');
        return true;
      }
      if (intent === 'skip') {
        concludeQuiz(s, say, 'skipped');
        return true;
      }
      if (intent === 'dontKnow' || intent === 'revealAnswer') {
        concludeQuiz(s, say, 'dontKnow');
        return true;
      }
      return false;
    }

    case 'noStory':
      if (s.stage !== 'behavioral') return false;
      if (intent === 'affirm') {
        ask(s, say, S.NO_STORY_YET);
        return true;
      }
      if (intent === 'decline' || intent === 'skip' || intent === 'dontKnow') {
        finishStory(s, say, ['Okay, let’s leave that one.'], { noStory: true });
        return true;
      }
      return false;
  }
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
        concludeQuiz(s, say, 'answered');
      }
      return;
    case 'questions':
      onQuestions(s, say, '', true);
      return;
    case 'coding':
      onCodingSilence(s, say);
      return;
    case 'design':
      s.awaiting = true; // thinking or writing notes: the candidate moves on with "next step"
      return;
    default: {
      // intro and behavioral: encourage once, then move on
      const pending = s.expect;
      if (s.silences === 1) {
        ask(s, say, S.ENCOURAGE_SILENCE);
        s.expect = pending;
        s.silences = 1; // keep counting: a second silence moves on
      } else skipStage(s, say);
    }
  }
}

function skipStage(s: EngineState, say: string[]) {
  switch (s.stage) {
    case 'opening':
      s.stage = 'intro';
      ask(s, say, S.INTRO_ASK);
      return;
    case 'intro':
      if (!s.intro.answers.length) s.skipped.push('intro');
      startWarmup(s, say);
      return;
    case 'warmup':
      if (s.warm.current) concludeQuiz(s, say, 'skipped');
      return;
    case 'coding':
      finishCoding(s, say, ['Okay, let’s move on.'], { skipped: true });
      return;
    case 'design':
      finishDesign(s, say, ['Okay, let’s move on.']);
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

const hasWarmup = (p: InterviewPlan) => p.warmupCount > 0 && p.quiz.length > 0;

function startWarmup(s: EngineState, say: string[]) {
  if (!hasWarmup(s.plan)) {
    afterWarmup(s, say);
    return;
  }
  s.stage = 'warmup';
  tell(s, say, S.WARMUP_START);
  nextQuiz(s, say, true);
}

function afterWarmup(s: EngineState, say: string[]) {
  if (s.plan.coding) startCoding(s, say);
  else afterCoding(s, say);
}

const quizById = (s: EngineState, id: string) => s.plan.quiz.find((q) => q.id === id)!;

function nextQuiz(s: EngineState, say: string[], first = false) {
  const left = s.plan.quiz.filter((q) => !s.warm.asked.includes(q.id));
  if (s.warm.results.length >= s.plan.warmupCount || !left.length) {
    afterWarmup(s, say);
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
  s.warm.current = {
    id: q.id,
    phase: 'ask',
    answers: [],
    hints: 0,
    hintedTerms: [],
    clarifies: 0,
  };
  ask(s, say, ...(first ? [q.ask] : [pick(s, S.WARMUP_NEXT), q.ask]));
}

/** Grade of everything said for the current question (keywords, plus the on-device AI if any). */
function warmGrade(cur: CurrentQuiz, q: QuizMaterial) {
  const g = gradeAnswer(cur.answers.join(' '), q.keyPoints);
  if (!cur.ai) return { ...g, incorrect: [] as string[], checkedBy: 'keywords' as CheckedBy };
  return { ...combineWithAI(g, cur.ai, q.keyPoints), checkedBy: 'keywords+ai' as CheckedBy };
}

/**
 * What the on-device AI needs to check this reply to a fundamentals question, or null when the reply
 * is not an answer (a hint request, "repeat that", "no thanks"…).
 */
export function warmupAnswerToCheck(
  st: EngineState,
  text: string
): { question: string; modelAnswer: string; keyPoints: string[]; answer: string } | null {
  const cur = st.stage === 'warmup' ? st.warm.current : null;
  if (!cur) return null;
  const q = quizById(st, cur.id);
  const intent = intentOf(text);
  if (intent !== 'answer' && !(intent === 'dontKnow' && hasSubstance(text, q.keyPoints)))
    return null;
  return {
    question: q.ask,
    modelAnswer: q.summary,
    keyPoints: q.keyPoints,
    answer: [...cur.answers, text].join(' '),
  };
}

/** A hint the candidate asked for: points at a key point they have not covered yet. */
function warmHint(s: EngineState, say: string[]) {
  const cur = s.warm.current!;
  const q = quizById(s, cur.id);
  const { missing } = warmGrade(cur, q);
  const term = missing.find((m) => !cur.hintedTerms.includes(m));
  cur.hints++;
  if (term) {
    cur.hintedTerms.push(term);
    ask(s, say, S.hintFor(term));
  } else {
    ask(s, say, S.WARMUP_CLARIFY);
  }
  if (cur.phase === 'probe') s.expect = 'anythingElse';
}

function onWarmup(s: EngineState, say: string[], text: string, intent: Intent) {
  const cur = s.warm.current;
  if (!cur) return;
  const q = quizById(s, cur.id);
  // "No" or "just tell me" as an answer to a fundamentals question means "I don't know".
  if (intent === 'dontKnow' || intent === 'revealAnswer' || intent === 'decline') {
    concludeQuiz(s, say, 'dontKnow');
    return;
  }
  cur.answers.push(text);
  const g = warmGrade(cur, q);

  if (cur.phase === 'ask') {
    cur.phase = 'probe';
    if (g.grade === 'good' && g.missing.length) {
      askExpect(s, say, 'anythingElse', pick(s, S.ACK_GOOD), S.probeMissing(g.missing[0]));
      return;
    }
    // Not there yet: invite more without giving anything away. No hint unless they ask.
    if (g.grade !== 'good' && wordCount(text) >= 3) {
      askExpect(s, say, 'anythingElse', pick(s, S.ACK_PARTIAL), pick(s, S.PROBE_DEEPER));
      return;
    }
  }
  concludeQuiz(s, say, 'answered');
}

/**
 * Ends the current question. Whatever was already said keeps its grade: "skip", "I don't know" or
 * silence after a partial answer does not wipe it out. With nothing relevant said, the reason
 * decides: skipped, didn't know, or (for a real attempt) weak.
 */
function concludeQuiz(
  s: EngineState,
  say: string[],
  reason: 'answered' | 'dontKnow' | 'skipped',
  advance = true
) {
  const cur = s.warm.current!;
  const q = quizById(s, cur.id);
  const g = cur.answers.length ? warmGrade(cur, q) : null;
  const grade: WarmGrade =
    g && g.grade !== 'weak'
      ? g.grade
      : reason === 'answered'
        ? cur.answers.some((a) => a !== '')
          ? 'weak'
          : 'dontKnow'
        : reason;
  const lines =
    grade === 'good'
      ? [pick(s, S.ACK_GOOD)]
      : grade === 'partial'
        ? [S.FINISH_PARTIAL, S.explain(q.summary)]
        : grade === 'skipped'
          ? ['No problem, let’s skip that one.']
          : [pick(s, S.ACK_DONT_KNOW), S.explain(q.summary)];
  finishQuiz(s, say, grade, lines, advance);
}

function finishQuiz(
  s: EngineState,
  say: string[],
  grade: WarmGrade,
  lines: string[],
  advance = true
) {
  const cur = s.warm.current!;
  const q = quizById(s, cur.id);
  const g = warmGrade(cur, q);
  const penalty = Math.min(2, cur.hints) * WARM_HINT_COST;
  s.warm.results.push({
    id: q.id,
    title: q.title,
    grade,
    hinted: cur.hints > 0,
    hints: cur.hints,
    score: Math.max(0, SCORE[grade] - (SCORE[grade] ? penalty : 0)),
    hit: g.hit,
    missing: g.missing,
    contradicted: g.contradicted,
    matched: g.matched,
    incorrect: g.incorrect,
    answer: cur.answers.filter(Boolean).join(' '),
    summary: q.summary,
    checkedBy: g.checkedBy,
  });
  s.warm.level =
    grade === 'good' ? up(s.warm.level) : grade === 'partial' ? s.warm.level : down(s.warm.level);
  s.warm.current = null;
  tell(s, say, ...lines);
  if (advance) nextQuiz(s, say);
}

// ---- coding round ----

const DONE_CODING =
  /\b(i'?m done|i am done|i'?m finished|i am finished|done coding|that'?s my solution|i think i'?m done)\b/i;

function startCoding(s: EngineState, say: string[]) {
  const m = s.plan.coding!;
  s.stage = 'coding';
  s.coding.phase = 'clarify';
  askExpect(s, say, 'haveQuestions', S.CODING_START, ...S.codingIntro(m.title, m.intro));
}

function startCodingPhase(s: EngineState, say: string[]) {
  s.coding.phase = 'coding';
  ask(s, say, s.coding.clarifications ? S.CODING_GO : S.CODING_GO_NO_QUESTIONS);
}

function onCoding(s: EngineState, say: string[], text: string, intent: Intent) {
  const c = s.coding;
  if (intent === 'hint') {
    s.hintsAsked++;
    codingHint(s, say);
    return;
  }
  if (intent === 'revealAnswer' && c.phase !== 'followups') {
    s.hintsAsked++;
    codingHint(s, say, [S.NO_SOLUTION]);
    return;
  }
  if (intent === 'skip' && c.phase !== 'followups') {
    finishCoding(s, say, ['Okay, let’s move on.'], { skipped: !c.tests });
    return;
  }
  if (c.phase === 'followups') {
    onCodingFollowup(s, say, text);
    return;
  }
  const question = isQuestion(text) || intent === 'clarify';
  if (c.phase === 'clarify') {
    if (question && c.clarifications < 3) {
      c.clarifications++;
      const req = answerFromRequirements(text, s.plan.coding!.requirements);
      askExpect(
        s,
        say,
        'haveQuestions',
        req ? S.CLARIFY_ANSWER(req) : S.CLARIFY_OPEN,
        S.CLARIFY_MORE
      );
      return;
    }
    startCodingPhase(s, say);
    return;
  }
  // Phase 'coding': the candidate is thinking out loud, asking, or saying they are done.
  if (DONE_CODING.test(text) && wordCount(text) <= 12) {
    doneCoding(s, say);
    return;
  }
  if (question) {
    const req = answerFromRequirements(text, s.plan.coding!.requirements);
    ask(s, say, req ? S.CLARIFY_ANSWER(req) : S.CLARIFY_OPEN);
    return;
  }
  // "ok", "hmm": not thinking out loud.
  if (wordCount(text) < 4) {
    s.awaiting = true;
    return;
  }
  c.thinkAloud++;
  // A real interviewer mostly listens while you code: acknowledge now and then.
  if (c.thinkAloud % 2 === 1) ask(s, say, pick(s, S.THINK_ACK));
  else s.awaiting = true;
}

function onCodingSilence(s: EngineState, say: string[]) {
  const c = s.coding;
  if (c.phase === 'clarify') {
    startCodingPhase(s, say);
  } else if (c.phase === 'followups') {
    s.transcript.push({ who: 'candidate', text: '(no answer)', stage: s.stage });
    onCodingFollowup(s, say, '');
  } else {
    s.awaiting = true; // silence while coding is normal
  }
}

function codingHint(s: EngineState, say: string[], lead: string[] = []) {
  const c = s.coding;
  const hints = s.plan.coding!.hints;
  if (c.hintIndex < hints.length) {
    ask(s, say, ...lead, S.CODING_HINT(hints[c.hintIndex]));
    c.hintIndex++;
  } else {
    ask(s, say, S.CODING_NO_MORE_HINTS);
  }
}

function doneCoding(s: EngineState, say: string[]) {
  const c = s.coding;
  if (!c.tests && !c.askedRun) {
    c.askedRun = true;
    ask(s, say, S.CODING_RUN_FIRST);
    return;
  }
  const passing = Boolean(c.tests && c.tests.total > 0 && c.tests.passed === c.tests.total);
  if (!passing && !c.confirmedDone) {
    c.confirmedDone = true;
    askExpect(s, say, 'keepGoingOrWalkthrough', S.CODING_STILL_FAILING);
    return;
  }
  startCodingFollowups(s, say, passing ? [S.CODING_ALL_PASS] : [], !passing);
}

function startCodingFollowups(s: EngineState, say: string[], lead: string[], walkthrough: boolean) {
  const c = s.coding;
  const m = s.plan.coding!;
  c.phase = 'followups';
  c.qIndex = 0;
  c.questions = [
    ...(walkthrough ? [{ kind: 'walkthrough' as const, ask: S.CODING_WALKTHROUGH }] : []),
    { kind: 'complexity' as const, ask: S.CODING_COMPLEXITY_Q },
    ...(m.edgeCases[0] ? [{ kind: 'edge' as const, ask: S.codingEdgeQ(m.edgeCases[0]) }] : []),
    ...(c.solvedEarly && m.followUps[0] ? [{ kind: 'twist' as const, ask: m.followUps[0] }] : []),
  ];
  ask(s, say, ...lead, c.questions[0].ask);
}

function onCodingFollowup(s: EngineState, say: string[], text: string) {
  const c = s.coding;
  const m = s.plan.coding!;
  const q = c.questions[c.qIndex];
  const reply: string[] = [];
  if (q.kind === 'complexity') {
    c.complexityCorrect = m.complexityTerms.length
      ? mentionsComplexity(text, m.complexityTerms)
      : wordCount(text) >= 3;
    reply.push(
      c.complexityCorrect || !m.complexity
        ? pick(s, S.CODING_COMPLEXITY_OK)
        : S.codingComplexityFix(m.complexity)
    );
  } else {
    if (q.kind === 'edge') c.edgeAnswered = wordCount(text) >= 6;
    reply.push(pick(s, S.CODING_FOLLOWUP_ACK));
  }
  c.qIndex++;
  if (c.qIndex < c.questions.length) ask(s, say, ...reply, c.questions[c.qIndex].ask);
  else finishCoding(s, say, [...reply, S.CODING_DONE]);
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function finishCoding(
  s: EngineState,
  say: string[],
  lines: string[],
  { skipped = false, advance = true }: { skipped?: boolean; advance?: boolean } = {}
) {
  const c = s.coding;
  const m = s.plan.coding!;
  const passed = c.tests?.passed ?? 0;
  const total = c.tests?.total ?? 0;
  const items: BreakdownItem[] = [
    {
      label: total ? `Tests passing (${passed}/${total})` : 'Tests (never run)',
      points: total ? Math.round((passed / total) * 50) : 0,
      max: 50,
    },
    { label: 'Asked a clarifying question', points: c.clarifications ? 10 : 0, max: 10 },
    { label: 'Thought out loud while coding', points: c.thinkAloud ? 10 : 0, max: 10 },
    { label: 'Stated the complexity correctly', points: c.complexityCorrect ? 15 : 0, max: 15 },
  ];
  if (m.edgeCases.length)
    items.push({
      label: 'Handled the edge case question',
      points: c.edgeAnswered ? 10 : 0,
      max: 10,
    });
  items.push({
    label: 'Finished within the time',
    points: total && !c.timedOut && !skipped ? 5 : 0,
    max: 5,
  });
  if (c.hintIndex) {
    const earned = items.reduce((t, x) => t + x.points, 0);
    items.push({
      label: `Hints used (${c.hintIndex})`,
      points: -Math.min(earned, c.hintIndex * 8),
      max: 0,
    });
  }
  const score = stageScore(items);
  const maxTotal = items.reduce((t, x) => t + x.max, 0);
  const lost = (pts: number) => Math.round((pts / maxTotal) * 100);

  const notes: Note[] = [];
  if (skipped)
    notes.push({ text: `You skipped the coding round. Practise "${m.title}".`, lost: 100 });
  else {
    if (!total || passed < total)
      notes.push({
        text: `Get all the tests passing: practise "${m.title}".`,
        lost: lost(50 - (items[0].points as number)),
      });
    if (!c.clarifications)
      notes.push({
        text: 'Ask at least one clarifying question before you start coding.',
        lost: lost(10),
      });
    if (!c.thinkAloud)
      notes.push({
        text: 'Think out loud while coding so the interviewer can follow your reasoning.',
        lost: lost(10),
      });
    if (!c.complexityCorrect && m.complexity)
      notes.push({
        text: `State the complexity clearly. For this problem: ${m.complexity}`,
        lost: lost(15),
      });
    if (m.edgeCases.length && !c.edgeAnswered)
      notes.push({
        text: `Talk through edge cases such as ${m.edgeCases[0].toLowerCase()}.`,
        lost: lost(10),
      });
    if (c.timedOut)
      notes.push({
        text: 'Manage your time: aim to have tests running halfway through.',
        lost: lost(5),
      });
    if (c.hintIndex)
      notes.push({
        text: `You used ${plural(c.hintIndex, 'hint')} in the coding round.`,
        lost: lost(Math.min(c.hintIndex * 8, 50)),
      });
  }
  c.result = {
    id: m.id,
    title: m.title,
    passed,
    total,
    hints: c.hintIndex,
    clarifications: c.clarifications,
    thinkAloud: c.thinkAloud,
    complexityCorrect: c.complexityCorrect,
    edgeAnswered: c.edgeAnswered,
    timedOut: c.timedOut,
    skipped,
    score,
    breakdown: items,
    notes,
  };
  if (skipped && !s.skipped.includes('coding')) s.skipped.push('coding');
  tell(s, say, ...lines);
  if (advance) afterCoding(s, say);
}

function afterCoding(s: EngineState, say: string[]) {
  if (s.plan.design) startDesign(s, say);
  else startBehavioral(s, say);
}

/** Reacts to the room during the coding and design rounds (tests, idle, time, done). */
export function roundEvent(prev: EngineState, ev: RoundEvent): Turn {
  const s: EngineState = structuredClone(prev);
  const say: string[] = [];
  if (s.stage === 'design') {
    onDesignEvent(s, say, ev);
    return { state: s, say };
  }
  const c = s.coding;
  if (s.stage !== 'coding' || c.phase === 'followups') return { state: s, say };

  switch (ev.type) {
    case 'tests': {
      c.tests = { passed: ev.passed, total: ev.total };
      c.runs++;
      if (c.phase === 'clarify') c.phase = 'coding';
      if (ev.total > 0 && ev.passed === ev.total) {
        c.solvedEarly = ev.elapsedRatio < 0.6;
        startCodingFollowups(s, say, [S.CODING_ALL_PASS], false);
      } else if (c.runs === 1) {
        ask(s, say, S.CODING_FAILING(ev.total - ev.passed));
      } else if (c.runs >= 3 && !c.offeredHint && c.hintIndex < s.plan.coding!.hints.length) {
        c.offeredHint = true;
        askExpect(s, say, 'hintOffer', S.CODING_OFFER_HINT);
      }
      break;
    }
    case 'idle':
      if (c.phase === 'coding' && c.nudges < 2) {
        c.nudges++;
        ask(s, say, S.CODING_NUDGE);
      }
      break;
    case 'timeWarning':
      if (!c.warnedTime) {
        c.warnedTime = true;
        ask(s, say, S.CODING_TIME_WARNING(Math.max(1, Math.round(ev.minutesLeft))));
      }
      break;
    case 'timeUp':
      c.timedOut = true;
      startCodingFollowups(s, say, [S.CODING_TIME_UP], true);
      break;
    case 'done':
      doneCoding(s, say);
      break;
  }
  return { state: s, say };
}

/** @deprecated use roundEvent */
export const codingEvent = roundEvent;

// ---- system design round ----

const DESIGN_SCORE: Record<Grade, number> = { good: 100, partial: 60, weak: 20 };
const DESIGN_HINT_COST = 5;

/** Design key points are many and broad: a few hits make a good answer. Length alone earns nothing. */
function gradeDesign(
  text: string,
  keyPoints: string[]
): { grade: Grade; hit: string[]; missing: string[] } {
  const { hit, missing, ratio } = coverage(text, keyPoints, 'loose');
  const grade: Grade =
    hit.length >= 3 || (hit.length >= 2 && ratio >= 0.5)
      ? 'good'
      : hit.length >= 1
        ? 'partial'
        : 'weak';
  return { grade, hit, missing };
}

/** A pushback answer is good when it names the approach (key words of the model answer). */
function goodPushback(answer: string, model: string): boolean {
  const n = wordCount(answer);
  const words = [
    ...new Set(
      (model.toLowerCase().match(/[a-z]{5,}/g) ?? []).filter(
        (w) => !/^(which|would|their|there|about|where|these|those|while|after|before)$/.test(w)
      )
    ),
  ];
  const hits = words.filter((w) => coverage(answer, [w], 'loose').hit.length).length;
  return (hits >= 2 && n >= 6) || n >= 25;
}

function startDesign(s: EngineState, say: string[]) {
  const m = s.plan.design!;
  s.stage = 'design';
  s.design.phase = 'steps';
  s.design.stepIndex = 0;
  ask(s, say, S.DESIGN_START, ...S.designIntro(m.title, m.intro), m.steps[0].ask);
}

/** Would the interviewer probe this answer? (Lets the room ask Chrome's AI only when needed.) */
export function designWouldProbe(st: EngineState, text: string, notes = ''): boolean {
  const d = st.design;
  if (st.stage !== 'design' || d.phase !== 'steps' || d.probed) return false;
  if (!['answer', 'dontKnow'].includes(intentOf(text))) return false;
  const step = st.plan.design!.steps[d.stepIndex];
  const all = [...d.answers, text, notes].join(' ');
  return gradeDesign(all, step.keyPoints).grade !== 'good';
}

function onDesign(
  s: EngineState,
  say: string[],
  text: string,
  intent: Intent,
  extras: AnswerExtras
) {
  const d = s.design;
  const m = s.plan.design!;
  if (d.phase === 'pushback') {
    onDesignPushback(s, say, text);
    return;
  }
  if (d.phase === 'lead') {
    d.leadAnswered = wordCount(text) >= 25 || coverage(text, m.leadPoints, 'loose').hit.length > 0;
    finishDesign(s, say, [pick(s, S.DESIGN_ACK), S.DESIGN_DONE]);
    return;
  }
  const step = m.steps[d.stepIndex];
  if (intent === 'skip') {
    finishDesignStep(s, say, '', extras.notes, true);
    return;
  }
  if (intent === 'hint' || intent === 'revealAnswer') {
    s.hintsAsked++;
    d.hints++;
    const { missing } = gradeDesign([...d.answers, extras.notes ?? ''].join(' '), step.keyPoints);
    ask(
      s,
      say,
      ...(intent === 'revealAnswer' ? [S.NO_SOLUTION] : []),
      S.designHint(missing[0] ?? step.keyPoints[0])
    );
    return;
  }
  if (intent === 'clarify' && wordCount(text) <= 8) {
    ask(s, say, S.DESIGN_CLARIFY);
    return;
  }
  d.answers.push(text);
  const { grade, missing } = gradeDesign(
    [...d.answers, extras.notes ?? ''].join(' '),
    step.keyPoints
  );
  if (grade !== 'good' && !d.probed && missing.length) {
    d.probed = true;
    ask(s, say, pick(s, S.DESIGN_ACK), extras.aiFollowUp?.trim() || S.designProbe(missing[0]));
    return;
  }
  finishDesignStep(s, say, '', extras.notes, false);
}

/** Grades the current step (spoken answers + notes) and moves to the next step or the pushback. */
function finishDesignStep(
  s: EngineState,
  say: string[],
  lastText: string,
  notes: string | undefined,
  skipped: boolean
) {
  const d = s.design;
  const m = s.plan.design!;
  const step = m.steps[d.stepIndex];
  if (lastText) d.answers.push(lastText);
  const graded = gradeDesign([...d.answers, notes ?? ''].join(' '), step.keyPoints);
  const grade: Grade = skipped && graded.grade === 'good' ? 'partial' : graded.grade;
  d.steps.push({
    id: step.id,
    label: step.label,
    grade,
    hit: graded.hit,
    missing: graded.missing,
    answer: d.answers.join(' '),
    notes: notes ?? '',
    reached: true,
  });
  const lines =
    grade === 'good'
      ? [pick(s, S.DESIGN_ACK_GOOD)]
      : graded.missing.length
        ? [pick(s, S.DESIGN_ACK), S.designNudge(graded.missing[0], graded.missing[1])]
        : [pick(s, S.DESIGN_ACK)];
  d.stepIndex++;
  d.probed = false;
  d.answers = [];
  if (d.stepIndex < m.steps.length) {
    ask(s, say, ...lines, m.steps[d.stepIndex].ask);
  } else {
    startDesignPushback(s, say, lines);
  }
}

function startDesignPushback(s: EngineState, say: string[], lead: string[]) {
  const d = s.design;
  const m = s.plan.design!;
  const count = s.plan.role === 'lead' ? 2 : 1;
  if (!m.pushbacks.length) {
    startDesignLead(s, say, lead);
    return;
  }
  d.phase = 'pushback';
  d.pushIndex = 0;
  d.pushbacks = [];
  d.pushLimit = Math.min(count, m.pushbacks.length);
  ask(s, say, ...lead, S.DESIGN_PUSHBACK_START, m.pushbacks[0].q);
}

function onDesignPushback(s: EngineState, say: string[], text: string) {
  const d = s.design;
  const m = s.plan.design!;
  const pb = m.pushbacks[d.pushIndex];
  const good = goodPushback(text, pb.a);
  d.pushbacks.push({ q: pb.q, good, answer: text });
  const reply = good ? pick(s, S.DESIGN_PUSHBACK_GOOD) : S.designPushbackTeach(pb.a);
  d.pushIndex++;
  if (d.pushIndex < d.pushLimit) ask(s, say, reply, m.pushbacks[d.pushIndex].q);
  else startDesignLead(s, say, [reply]);
}

function startDesignLead(s: EngineState, say: string[], lead: string[]) {
  const d = s.design;
  if (s.plan.role === 'lead' && s.plan.design!.leadPoints.length) {
    d.phase = 'lead';
    ask(s, say, ...lead, S.DESIGN_LEAD_Q);
  } else {
    finishDesign(s, say, [...lead, S.DESIGN_DONE]);
  }
}

function finishDesign(s: EngineState, say: string[], lines: string[], advance = true) {
  const d = s.design;
  const m = s.plan.design!;
  // Steps never reached count as missed.
  for (const step of m.steps.slice(d.steps.length)) {
    d.steps.push({
      id: step.id,
      label: step.label,
      grade: 'weak',
      hit: [],
      missing: step.keyPoints,
      answer: d.steps.length === d.stepIndex ? d.answers.join(' ') : '',
      notes: '',
      reached: false,
    });
  }
  const isLead = s.plan.role === 'lead' && m.leadPoints.length > 0;
  const stepsMax = isLead ? 65 : 75;
  const per = stepsMax / Math.max(1, d.steps.length);
  const items: BreakdownItem[] = d.steps.map((x) => ({
    label: `${x.label}${x.reached ? '' : ' (not reached)'}`,
    points: Math.round(((per * DESIGN_SCORE[x.grade]) / 100) * (x.reached ? 1 : 0) * 10) / 10,
    max: Math.round(per * 10) / 10,
  }));
  if (m.pushbacks.length) {
    const max = isLead ? 20 : 25;
    const asked = d.pushbacks.length || Math.min(isLead ? 2 : 1, m.pushbacks.length);
    items.push({
      label: `Pushback (${d.pushbacks.filter((p) => p.good).length}/${asked} handled)`,
      points: Math.round((d.pushbacks.filter((p) => p.good).length / asked) * max),
      max,
    });
  }
  if (isLead)
    items.push({
      label: 'Rollout and ownership as a lead',
      points: d.leadAnswered ? 15 : d.leadAnswered === false ? 4 : 0,
      max: 15,
    });
  if (d.timedOut) items.push({ label: 'Ran out of time', points: -5, max: 0 });
  if (d.hints)
    items.push({
      label: `Hints used (${d.hints})`,
      points: -Math.min(15, d.hints * DESIGN_HINT_COST),
      max: 0,
    });
  const score = stageScore(items);
  const maxTotal = items.reduce((t, x) => t + x.max, 0) || 1;
  const lost = (pts: number) => Math.round((pts / maxTotal) * 100);

  const notes: Note[] = [];
  for (const x of d.steps.filter((x) => x.grade !== 'good'))
    notes.push({
      text: `System design, ${x.label.toLowerCase()}: cover ${x.missing.slice(0, 2).join(' and ') || 'more of the key points'}.`,
      lost: lost(per - (per * DESIGN_SCORE[x.grade] * (x.reached ? 1 : 0)) / 100),
    });
  if (d.pushbacks.some((p) => !p.good))
    notes.push({
      text: 'Answer pushback with a concrete approach and its trade-off.',
      lost: lost(
        ((isLead ? 20 : 25) * d.pushbacks.filter((p) => !p.good).length) / d.pushbacks.length
      ),
    });
  if (isLead && !d.leadAnswered)
    notes.push({
      text: 'As a lead, explain how you would roll the design out across teams.',
      lost: lost(15),
    });
  if (d.timedOut)
    notes.push({ text: 'Manage time in system design: about 5 minutes per step.', lost: lost(5) });
  if (d.hints)
    notes.push({
      text: `You used ${plural(d.hints, 'hint')} in system design.`,
      lost: lost(Math.min(15, d.hints * DESIGN_HINT_COST)),
    });

  d.result = {
    id: m.id,
    title: m.title,
    steps: d.steps,
    pushbacks: d.pushbacks,
    leadAnswered: d.leadAnswered,
    timedOut: d.timedOut,
    hints: d.hints,
    score,
    breakdown: items,
    notes,
  };
  tell(s, say, ...lines);
  if (advance) startBehavioral(s, say);
}

function onDesignEvent(s: EngineState, say: string[], ev: RoundEvent) {
  const d = s.design;
  switch (ev.type) {
    case 'done':
      if (d.phase === 'steps') finishDesignStep(s, say, '', ev.notes, false);
      break;
    case 'timeWarning':
      if (!d.warnedTime) {
        d.warnedTime = true;
        ask(s, say, S.DESIGN_TIME_WARNING(Math.max(1, Math.round(ev.minutesLeft))));
      }
      break;
    case 'timeUp':
      d.timedOut = true;
      finishDesign(s, say, [S.DESIGN_TIME_UP]);
      break;
  }
}

// ---- behavioral ----

function startBehavioral(s: EngineState, say: string[]) {
  if (!s.plan.behavioral.length) {
    startQuestions(s, say);
    return;
  }
  s.stage = 'behavioral';
  s.beh = { ...s.beh, index: 0, probes: [], answers: [], hints: 0 };
  ask(s, say, S.BEHAVIORAL_START, s.plan.behavioral[0].ask);
}

function onBehavioral(s: EngineState, say: string[], text: string, intent: Intent) {
  // "I don't have an example": offer a way in before moving on.
  if ((intent === 'dontKnow' || intent === 'decline') && !s.beh.answers.length) {
    askExpect(s, say, 'noStory', S.BEHAVIORAL_NO_STORY);
    return;
  }
  if (intent === 'revealAnswer') {
    ask(s, say, S.BEHAVIORAL_NO_RIGHT_ANSWER);
    return;
  }
  if (intent === 'dontKnow') {
    finishStory(s, say, [pick(s, S.ACK_STORY)]);
    return;
  }
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

/** Minimum words for a story to count as an answer at all. */
const STORY_MIN_WORDS = 15;

function finishStory(
  s: EngineState,
  say: string[],
  lines: string[],
  { noStory = false, advance = true }: { noStory?: boolean; advance?: boolean } = {}
) {
  const m = s.plan.behavioral[s.beh.index];
  const all = s.beh.answers.join(' ');
  const sig = storySignals(all);
  const answered = !noStory && sig.words >= STORY_MIN_WORDS;
  const signals: StorySignals = {
    detail: answered && sig.words >= 80,
    ownership: answered && !sig.hidesBehindWe,
    result: answered && sig.hasResult,
    reflection: answered && sig.reflects,
  };
  const breakdown: BreakdownItem[] = [
    { label: 'Gave a real example', points: answered ? 20 : 0, max: 20 },
    { label: 'Enough context (situation and stakes)', points: signals.detail ? 20 : 0, max: 20 },
    { label: 'Clear about your own part', points: signals.ownership ? 20 : 0, max: 20 },
    { label: 'A concrete result', points: signals.result ? 20 : 0, max: 20 },
    { label: 'What you learned', points: signals.reflection ? 20 : 0, max: 20 },
  ];
  const notes: Note[] = [];
  if (!answered) {
    notes.push({
      text: noStory
        ? `No example for "${m.title}". Prepare a story for this one.`
        : all
          ? `Your answer to "${m.title}" was very short. Tell a full story: situation, your actions, the result.`
          : `Skipped "${m.title}". Prepare a story for this one.`,
      lost: 100,
    });
  } else {
    if (!signals.detail)
      notes.push({ text: 'Give more context: the situation and what was at stake.', lost: 20 });
    if (!signals.ownership)
      notes.push({ text: 'Say "I" more: make your own actions clear.', lost: 20 });
    if (!signals.result)
      notes.push({ text: 'End with a concrete result, ideally a number.', lost: 20 });
    if (!signals.reflection)
      notes.push({ text: 'Add what you learned or would do differently.', lost: 20 });
  }
  s.beh.results.push({
    id: m.id,
    title: m.title,
    score: stageScore(breakdown),
    answer: all,
    hints: s.beh.hints,
    noStory,
    signals,
    breakdown,
    notes,
  });
  tell(s, say, ...lines);
  if (!advance) return;
  const next = s.beh.index + 1;
  if (next < s.plan.behavioral.length) {
    s.beh = { ...s.beh, index: next, probes: [], answers: [], hints: 0 };
    ask(s, say, S.BEHAVIORAL_NEXT, s.plan.behavioral[next].ask);
  } else {
    startQuestions(s, say);
  }
}

// ---- candidate's questions & close ----

function startQuestions(s: EngineState, say: string[]) {
  s.stage = 'questions';
  askExpect(s, say, 'haveQuestions', S.QA_ASK);
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
    askExpect(s, say, 'haveQuestions', answer, S.QA_MORE);
  }
}

function close(s: EngineState, say: string[]) {
  tell(s, say, ...S.CLOSING);
  s.stage = 'done';
  s.awaiting = false;
}

/**
 * The candidate pressed End (or closed the tab): closes whatever is open with the credit earned so
 * far, without the interviewer saying anything, and marks the interview as ended early.
 */
export function endEarly(prev: EngineState): EngineState {
  const s: EngineState = structuredClone(prev);
  if (s.stage === 'done') return s;
  const keep = s.transcript.length;
  const say: string[] = [];
  s.endedEarly = true;
  s.endedDuring = s.stage;
  switch (s.stage) {
    case 'warmup':
      if (s.warm.current?.answers.some(Boolean)) concludeQuiz(s, say, 'answered', false);
      break;
    case 'coding':
      if (!s.coding.result) finishCoding(s, say, [], { advance: false });
      break;
    case 'design':
      if (!s.design.result) finishDesign(s, say, [], false);
      break;
    case 'behavioral':
      if (s.beh.answers.length) finishStory(s, say, [], { advance: false });
      break;
  }
  s.transcript.length = keep;
  s.stage = 'done';
  s.awaiting = false;
  s.expect = null;
  s.warm.current = null;
  return s;
}

// ---- report ----

export type StageStatus = 'completed' | 'partial' | 'skipped' | 'notReached';

export interface StageReport {
  id: Exclude<Stage, 'opening' | 'done'>;
  label: string;
  status: StageStatus;
  /** 0–100, or null when the round was not reached. */
  score: number | null;
  /** Share of the overall score. */
  weight: number;
  breakdown: BreakdownItem[];
}

export interface InterviewReport {
  version: 2;
  /** The interview ran to the closing. */
  completed: boolean;
  /** Label of the round the candidate ended in, when ended early. */
  endedDuring: string | null;
  /** Overall score across the whole plan (rounds not reached count as 0). */
  score: number;
  /** When ended early: the score over the rounds actually done. */
  completedScore: number | null;
  verdict: Verdict;
  stages: StageReport[];
  strengths: string[];
  /** Most costly first. */
  gaps: string[];
  warmup: WarmupResult[];
  coding: CodingResult | null;
  design: DesignResult | null;
  behavioral: BehavioralResult[];
  /** Hints the candidate asked for, in all rounds. */
  hintsUsed: number;
  hintsByRound: { warmup: number; coding: number; design: number; behavioral: number };
  questionsAsked: number;
  /** How fundamentals answers were checked. */
  checkedBy: CheckedBy;
  durationSec: number | null;
}

const WEIGHTS: Record<StageReport['id'], number> = {
  intro: 10,
  warmup: 20,
  coding: 25,
  design: 25,
  behavioral: 15,
  questions: 5,
};

const LABELS: Record<StageReport['id'], string> = {
  intro: 'Intro',
  warmup: 'Fundamentals',
  coding: 'Coding',
  design: 'System design',
  behavioral: 'Leadership',
  questions: 'Your questions',
};

export function buildReport(
  s: EngineState,
  { durationSec = null }: { durationSec?: number | null } = {}
): InterviewReport {
  const p = s.plan;
  const ended = s.endedEarly ? s.endedDuring : null;
  const endedAt = ended ? ORDER.indexOf(ended) : ORDER.length;
  const status = (id: StageReport['id']): StageStatus => {
    const at = ORDER.indexOf(id);
    if (ended && at > endedAt) return 'notReached';
    if (s.skipped.includes(id)) return 'skipped';
    if (ended && at === endedAt) return 'partial';
    return 'completed';
  };

  const planned: StageReport['id'][] = [
    'intro',
    ...(hasWarmup(p) ? (['warmup'] as const) : []),
    ...(p.coding ? (['coding'] as const) : []),
    ...(p.design ? (['design'] as const) : []),
    ...(p.behavioral.length ? (['behavioral'] as const) : []),
    'questions',
  ];

  const gaps: { text: string; impact: number; stage: StageReport['id'] }[] = [];
  const gap = (stage: StageReport['id'], text: string, impact: number) =>
    gaps.push({ text, impact, stage });
  const stages: StageReport[] = [];
  for (const id of planned) {
    const st = status(id);
    let breakdown: BreakdownItem[] = [];
    let score: number | null = null;
    switch (id) {
      case 'intro': {
        const text = s.intro.answers.join(' ');
        const n = wordCount(text);
        if (st === 'notReached' || (st === 'partial' && !n)) break;
        breakdown = [
          { label: 'Introduced yourself', points: n ? 40 : 0, max: 40 },
          { label: 'About a minute long (60+ words)', points: n >= 60 ? 20 : 0, max: 20 },
          {
            label: 'Mentioned scope or impact (led, built, shipped…)',
            points:
              n &&
              /\b(lead|led|team|built|improv\w*|own\w*|ship\w*|launch\w*|scal\w*)\b/i.test(text)
                ? 20
                : 0,
            max: 20,
          },
          { label: 'Kept it concise (under 300 words)', points: n && n <= 300 ? 20 : 0, max: 20 },
        ];
        score = stageScore(breakdown);
        if (!n) gap(id, 'Prepare a one-minute intro: role, scope, one highlight.', 100);
        else if (n < 60)
          gap(id, 'Your intro was short. Aim for about a minute: role, scope, one highlight.', 20);
        else if (n > 300) gap(id, 'Your intro ran long. Keep it to about a minute.', 20);
        break;
      }
      case 'warmup': {
        if (st === 'notReached') break;
        const rs = s.warm.results;
        const count = ended ? Math.max(rs.length, p.warmupCount) : rs.length;
        if (!count) break;
        breakdown = [
          ...rs.map((r) => ({ label: r.title, points: r.score, max: 100 })),
          ...Array.from({ length: count - rs.length }, () => ({
            label: 'Not answered (interview ended)',
            points: 0,
            max: 100,
          })),
        ];
        score = stageScore(breakdown);
        for (const r of rs.filter((x) => x.grade !== 'good')) {
          const detail = r.contradicted.length
            ? `: check what you said about ${r.contradicted.slice(0, 2).join(' and ')}`
            : r.incorrect.length
              ? `: part of your answer was not right`
              : r.missing.length
                ? `: mention ${r.missing.slice(0, 2).join(' and ')}`
                : '';
          gap(id, `Revisit "${r.title}"${detail}.`, (100 - r.score) / count);
        }
        break;
      }
      case 'coding': {
        const r = s.coding.result;
        if (st === 'notReached' || !r) {
          if (st !== 'notReached') score = 0;
          break;
        }
        breakdown = r.breakdown;
        score = r.score;
        for (const n of r.notes) gap(id, n.text, n.lost);
        break;
      }
      case 'design': {
        const r = s.design.result;
        if (st === 'notReached' || !r) {
          if (st !== 'notReached') score = 0;
          break;
        }
        breakdown = r.breakdown;
        score = r.score;
        for (const n of r.notes) gap(id, n.text, n.lost);
        break;
      }
      case 'behavioral': {
        if (st === 'notReached') break;
        const rs = s.beh.results;
        const count = ended ? Math.max(rs.length, p.behavioral.length) : rs.length;
        if (!count) break;
        breakdown = [
          ...rs.map((r) => ({ label: r.title, points: r.score, max: 100 })),
          ...Array.from({ length: count - rs.length }, () => ({
            label: 'Not answered (interview ended)',
            points: 0,
            max: 100,
          })),
        ];
        score = stageScore(breakdown);
        for (const r of rs) for (const n of r.notes) gap(id, n.text, n.lost / count);
        break;
      }
      case 'questions': {
        if (st === 'notReached' || (st === 'partial' && !s.qa.count)) break;
        breakdown = [
          { label: 'Stayed engaged at the end', points: 40, max: 40 },
          { label: 'Asked the interviewer a question', points: s.qa.count ? 60 : 0, max: 60 },
        ];
        score = stageScore(breakdown);
        if (!s.qa.count) gap(id, 'Prepare one or two questions for the interviewer.', 60);
        break;
      }
    }
    stages.push({ id, label: LABELS[id], status: st, score, weight: WEIGHTS[id], breakdown });
  }

  // A round that was completed but had nothing to grade (e.g. no questions left) does not count.
  const counted = stages.filter((x) => !(x.status === 'completed' && x.score === null));
  const totalW = counted.reduce((t, x) => t + x.weight, 0);
  const score = totalW
    ? Math.round(counted.reduce((t, x) => t + (x.score ?? 0) * x.weight, 0) / totalW)
    : 0;
  const done = counted.filter((x) => x.score !== null);
  const doneW = done.reduce((t, x) => t + x.weight, 0);
  const completedScore =
    ended && doneW
      ? Math.round(done.reduce((t, x) => t + (x.score ?? 0) * x.weight, 0) / doneW)
      : null;

  // Gap impact in overall-score points: points lost in the round × the round's share.
  const merged = new Map<string, number>();
  for (const g of gaps)
    merged.set(
      g.text,
      (merged.get(g.text) ?? 0) + (totalW ? (g.impact * WEIGHTS[g.stage]) / totalW : 0)
    );
  for (const x of stages.filter((x) => x.status === 'notReached'))
    merged.set(
      `Not reached: ${x.label.toLowerCase()}. Finish a full interview to get feedback on it.`,
      x.weight
    );
  const sortedGaps = [...merged.entries()].sort((a, b) => b[1] - a[1]).map(([text]) => text);

  const strengths: string[] = [];
  const codingResult = s.coding.result;
  const designResult = s.design.result;
  const intro = stages.find((x) => x.id === 'intro')?.score ?? null;
  const good = s.warm.results.filter((r) => r.grade === 'good').length;
  if (good) strengths.push(`Solid on ${good} of ${s.warm.results.length} fundamentals questions.`);
  if (s.beh.results.some((r) => r.score >= 80))
    strengths.push('Clear, structured leadership stories.');
  if (intro !== null && intro >= 80) strengths.push('A concise, relevant introduction.');
  if (codingResult && codingResult.total && codingResult.passed === codingResult.total)
    strengths.push(`Solved the coding problem with all ${codingResult.total} tests passing.`);
  if (codingResult?.clarifications) strengths.push('Asked clarifying questions before coding.');
  if (codingResult?.complexityCorrect)
    strengths.push('Stated the complexity of your solution correctly.');
  if (designResult && designResult.score >= 75)
    strengths.push('A structured system design that covered the key areas.');
  if (s.qa.count) strengths.push('Asked thoughtful questions at the end.');

  const hintsByRound = {
    warmup: s.warm.results.reduce((t, r) => t + r.hints, 0),
    coding: codingResult?.hints ?? 0,
    design: designResult?.hints ?? 0,
    behavioral: s.beh.results.reduce((t, r) => t + r.hints, 0),
  };

  return {
    version: 2,
    completed: !s.endedEarly,
    endedDuring: ended ? (STAGES.find((x) => x.id === ended)?.label ?? ended) : null,
    score,
    completedScore,
    verdict: s.endedEarly ? INCOMPLETE : verdict(score),
    stages,
    strengths,
    gaps: sortedGaps,
    warmup: s.warm.results,
    coding: codingResult,
    design: designResult,
    behavioral: s.beh.results,
    hintsUsed: Object.values(hintsByRound).reduce((a, b) => a + b, 0),
    hintsByRound,
    questionsAsked: s.qa.count,
    checkedBy: s.warm.results.some((r) => r.checkedBy === 'keywords+ai')
      ? 'keywords+ai'
      : 'keywords',
    durationSec,
  };
}
