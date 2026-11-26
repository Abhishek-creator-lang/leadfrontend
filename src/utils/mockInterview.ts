import type { Difficulty, Format, QuestionSummary } from '@/content/types';

/**
 * Mock interview: a timed loop of rounds (coding, UI, system design, behavioral) picked from the
 * catalog, each self-graded against a lead-level rubric. Runs entirely in the browser: no server
 * calls, no paid APIs. State lives in localStorage (src/context/MockInterviewContext.tsx).
 */

export type MockTrackId = 'lead' | 'senior' | 'quick';

export interface MockTrack {
  id: MockTrackId;
  label: string;
  description: string;
  rounds: { format: Format; minutes: number }[];
}

export const MOCK_TRACKS: Record<MockTrackId, MockTrack> = {
  lead: {
    id: 'lead',
    label: 'Lead loop',
    description: 'Coding, UI, system design and two leadership rounds, like a full lead onsite.',
    rounds: [
      { format: 'javascript', minutes: 25 },
      { format: 'user-interface', minutes: 40 },
      { format: 'system-design', minutes: 45 },
      { format: 'behavioral', minutes: 15 },
      { format: 'behavioral', minutes: 15 },
    ],
  },
  senior: {
    id: 'senior',
    label: 'Senior loop',
    description: 'Coding, UI, system design and one behavioral round.',
    rounds: [
      { format: 'javascript', minutes: 25 },
      { format: 'user-interface', minutes: 40 },
      { format: 'system-design', minutes: 40 },
      { format: 'behavioral', minutes: 15 },
    ],
  },
  quick: {
    id: 'quick',
    label: 'Quick 45',
    description: 'One coding round and one system design round when you are short on time.',
    rounds: [
      { format: 'javascript', minutes: 20 },
      { format: 'system-design', minutes: 25 },
    ],
  },
};

/** What a lead-level interviewer checks in each kind of round. The score is the share ticked. */
export const RUBRICS: Record<Format, string[]> = {
  javascript: [
    'Clarified requirements and edge cases before coding',
    'Working solution that passes the tests',
    'Handled edge cases (empty input, errors, async timing)',
    'Readable code: clear names, small functions',
    'Explained time and space complexity',
    'Talked through trade-offs while coding',
  ],
  algorithms: [
    'Clarified constraints and input size',
    'Started from a brute force, then improved it',
    'Working solution that passes the tests',
    'Explained time and space complexity',
    'Readable code with clear names',
  ],
  'user-interface': [
    'Clarified requirements and scope first',
    'Working component that meets the requirements',
    'Sensible component and state structure',
    'Accessible: keyboard, focus, semantics, ARIA where needed',
    'Handled loading, empty and error states',
    'Mentioned performance or testing approach',
  ],
  'system-design': [
    'Requirements: functional, non-functional and scope agreed',
    'Architecture: clear components and responsibilities',
    'Data model and client state shape',
    'API / interface design between client and server',
    'Performance: rendering, network, caching',
    'Accessibility, i18n and security considered',
    'Trade-offs discussed and decisions justified',
    'Drove the conversation and managed time',
  ],
  behavioral: [
    'Clear STAR structure (situation, task, action, result)',
    'Showed personal ownership ("I", not only "we")',
    'Influenced or led others without relying on authority',
    'Measurable impact or a concrete result',
    'Handled conflict or disagreement constructively',
    'Reflected on what they would do differently',
  ],
  quiz: ['Correct answer', 'Explained the why, not just the what', 'Gave a practical example'],
};

export interface MockRound {
  format: Format;
  questionId: string;
  minutes: number;
  /** ms timestamps; set when the round starts and ends */
  startedAt?: number;
  endedAt?: number;
  /** indexes of rubric items ticked */
  checked: number[];
  graded: boolean;
}

export interface MockSession {
  id: string;
  track: MockTrackId;
  company: string | null;
  createdAt: number;
  rounds: MockRound[];
  current: number;
  finishedAt?: number;
}

const DIFFICULTY_WEIGHT: Record<Difficulty, number> = { easy: 1, medium: 3, hard: 4 };

/**
 * Picks one question per round. Prefers questions asked at `company`, then ones the user has not
 * completed, weighted towards medium/hard and high-importance questions. Never repeats a question.
 */
export function pickQuestions(
  questions: QuestionSummary[],
  track: MockTrack,
  {
    company = null,
    completed = {},
    random = Math.random,
  }: { company?: string | null; completed?: Record<string, unknown>; random?: () => number } = {}
): string[] {
  const used = new Set<string>();
  return track.rounds.map(({ format }) => {
    const pool = questions.filter((q) => q.format === format && !used.has(q.id));
    const atCompany = company ? pool.filter((q) => q.companies.includes(company)) : [];
    const fresh = (atCompany.length ? atCompany : pool).filter((q) => !completed[q.id]);
    const candidates = fresh.length ? fresh : atCompany.length ? atCompany : pool;
    if (!candidates.length) return '';
    const weight = (q: QuestionSummary) =>
      DIFFICULTY_WEIGHT[q.difficulty] * (q.importance === 'high' ? 2 : 1);
    const total = candidates.reduce((sum, q) => sum + weight(q), 0);
    let r = random() * total;
    const pick = candidates.find((q) => (r -= weight(q)) < 0) ?? candidates[candidates.length - 1];
    used.add(pick.id);
    return pick.id;
  });
}

export function createSession(
  questions: QuestionSummary[],
  trackId: MockTrackId,
  opts: { company?: string | null; completed?: Record<string, unknown>; now?: number } = {}
): MockSession {
  const track = MOCK_TRACKS[trackId];
  const ids = pickQuestions(questions, track, opts);
  const now = opts.now ?? Date.now();
  return {
    id: `${now.toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    track: trackId,
    company: opts.company ?? null,
    createdAt: now,
    current: 0,
    rounds: track.rounds
      .map((r, i) => ({ ...r, questionId: ids[i], checked: [], graded: false }))
      .filter((r) => r.questionId),
  };
}

/** 0–100 for one round. */
export const roundScore = (r: MockRound) =>
  Math.round((r.checked.length / RUBRICS[r.format].length) * 100);

/** 0–100 overall: rounds weighted by their time budget, like a real loop. */
export function sessionScore(s: MockSession): number {
  const graded = s.rounds.filter((r) => r.graded);
  const minutes = graded.reduce((sum, r) => sum + r.minutes, 0);
  if (!minutes) return 0;
  return Math.round(graded.reduce((sum, r) => sum + roundScore(r) * r.minutes, 0) / minutes);
}

export function verdict(score: number): {
  label: string;
  color: 'success' | 'info' | 'warning' | 'error';
} {
  if (score >= 85) return { label: 'Strong hire', color: 'success' };
  if (score >= 70) return { label: 'Hire', color: 'info' };
  if (score >= 50) return { label: 'Lean no hire', color: 'warning' };
  return { label: 'No hire', color: 'error' };
}

/** Seconds left in a round (negative when over time). */
export function secondsLeft(r: MockRound, now: number): number {
  if (r.startedAt === undefined) return r.minutes * 60;
  const end = r.endedAt ?? now;
  return Math.round(r.minutes * 60 - (end - r.startedAt) / 1000);
}

export function formatClock(seconds: number): string {
  const sign = seconds < 0 ? '-' : '';
  const s = Math.abs(seconds);
  return `${sign}${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
