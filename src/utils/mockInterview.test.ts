import { describe, expect, it } from 'vitest';
import type { QuestionSummary } from '@/content/types';
import {
  createSession,
  formatClock,
  MOCK_TRACKS,
  pickQuestions,
  RUBRICS,
  secondsLeft,
  sessionScore,
  verdict,
  type MockSession,
} from './mockInterview';

const q = (id: string, extra: Partial<QuestionSummary> = {}): QuestionSummary =>
  ({
    id,
    slug: id.split('/')[1],
    format: id.split('/')[0],
    title: id,
    excerpt: '',
    difficulty: 'medium',
    importance: 'mid',
    duration: 20,
    topics: [],
    companies: [],
    ...extra,
  }) as QuestionSummary;

const CATALOG = [
  q('javascript/debounce', { companies: ['Google'] }),
  q('javascript/throttle'),
  q('user-interface/tabs'),
  q('system-design/news-feed'),
  q('behavioral/conflict'),
  q('behavioral/mentoring'),
];

describe('pickQuestions', () => {
  it('picks one question per round, in format order, without repeats', () => {
    const ids = pickQuestions(CATALOG, MOCK_TRACKS.lead);
    expect(ids.map((id) => id.split('/')[0])).toEqual([
      'javascript',
      'user-interface',
      'system-design',
      'behavioral',
      'behavioral',
    ]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('prefers questions asked at the chosen company', () => {
    for (let i = 0; i < 20; i++) {
      expect(pickQuestions(CATALOG, MOCK_TRACKS.quick, { company: 'Google' })[0]).toBe(
        'javascript/debounce'
      );
    }
  });

  it('skips completed questions when others are left', () => {
    const ids = pickQuestions(CATALOG, MOCK_TRACKS.quick, {
      completed: { 'javascript/debounce': '2026-01-01' },
    });
    expect(ids[0]).toBe('javascript/throttle');
  });

  it('drops rounds with no questions of that format', () => {
    const s = createSession([q('javascript/a')], 'lead');
    expect(s.rounds).toHaveLength(1);
  });
});

describe('scoring', () => {
  const session = (checks: number[][]): MockSession => ({
    id: 'x',
    track: 'quick',
    company: null,
    createdAt: 0,
    current: 0,
    rounds: [
      { format: 'javascript', questionId: 'a', minutes: 20, checked: checks[0], graded: true },
      { format: 'system-design', questionId: 'b', minutes: 25, checked: checks[1], graded: true },
    ],
  });

  it('weights rounds by their minutes', () => {
    const all = (n: number) => Array.from({ length: n }, (_, i) => i);
    expect(sessionScore(session([all(RUBRICS.javascript.length), []]))).toBe(44);
    expect(
      sessionScore(session([all(RUBRICS.javascript.length), all(RUBRICS['system-design'].length)]))
    ).toBe(100);
  });

  it('maps scores to verdicts', () => {
    expect(verdict(90).label).toBe('Strong hire');
    expect(verdict(70).label).toBe('Hire');
    expect(verdict(50).label).toBe('Lean no hire');
    expect(verdict(10).label).toBe('No hire');
  });
});

describe('timer', () => {
  it('counts down from the round budget and goes negative when over', () => {
    const r = {
      format: 'javascript' as const,
      questionId: 'a',
      minutes: 1,
      checked: [],
      graded: false,
    };
    expect(secondsLeft(r, 0)).toBe(60);
    expect(secondsLeft({ ...r, startedAt: 0 }, 30_000)).toBe(30);
    expect(secondsLeft({ ...r, startedAt: 0 }, 90_000)).toBe(-30);
    expect(formatClock(-30)).toBe('-0:30');
    expect(formatClock(605)).toBe('10:05');
  });
});
