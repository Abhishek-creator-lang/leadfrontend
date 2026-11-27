// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '@/constants/storage';
import {
  buildReport,
  endEarly,
  respond,
  startInterview,
  type InterviewPlan,
} from '@/utils/interview/engine';
import {
  deleteRecord,
  getRecord,
  loadHistory,
  saveRecord,
  type LiveInterviewRecord,
} from './liveStore';

const PLAN: InterviewPlan = {
  role: 'lead',
  warmupCount: 0,
  introFollowups: 0,
  quiz: [],
  behavioral: [],
  coding: null,
  design: null,
};

function record(id: string, at: number, transcriptSize = 2): LiveInterviewRecord {
  const s = endEarly(respond(startInterview(PLAN).state, 'ok').state);
  return {
    id,
    at,
    config: { role: 'lead', length: 'short', mode: 'text' },
    report: buildReport(s),
    transcript: Array.from({ length: transcriptSize }, (_, i) => ({
      who: 'candidate' as const,
      text: `line ${i}`,
      stage: 'intro' as const,
    })),
  };
}

beforeEach(() => localStorage.clear());

describe('liveStore', () => {
  it('saves newest first, replaces by id and deletes', () => {
    saveRecord(record('a', 1));
    saveRecord(record('b', 2));
    saveRecord({ ...record('a', 1), transcript: [] });
    expect(loadHistory().map((r) => r.id)).toEqual(['b', 'a']);
    expect(getRecord('a')!.transcript).toEqual([]);
    deleteRecord('b');
    expect(loadHistory().map((r) => r.id)).toEqual(['a']);
  });

  it('migrates reports saved by the first version', () => {
    localStorage.setItem(
      STORAGE_KEYS.liveInterview,
      JSON.stringify([
        {
          id: 'old',
          at: 5,
          config: { role: 'senior', length: 'short', mode: 'text' },
          report: {
            score: 72,
            verdict: { label: 'Hire', color: 'info' },
            stages: [
              { id: 'intro', label: 'Intro', score: 80 },
              { id: 'design', label: 'System design', score: null },
            ],
            strengths: ['x'],
            gaps: ['y'],
            warmup: [
              { id: 'quiz/a', title: 'A', grade: 'good', hinted: false, score: 100, missing: [] },
            ],
            coding: null,
            design: null,
            behavioral: [{ id: 'b', title: 'B', score: 60, notes: ['Say "I" more.'] }],
            hintsUsed: 0,
          },
        },
      ])
    );
    const [r] = loadHistory();
    expect(r.legacy).toBe(true);
    expect(r.report).toMatchObject({ version: 2, score: 72, completed: true });
    expect(r.report.stages).toHaveLength(1);
    expect(r.report.warmup[0]).toMatchObject({ hit: [], answer: '', checkedBy: 'keywords' });
    expect(r.report.behavioral[0].notes).toEqual([{ text: 'Say "I" more.', lost: 0 }]);
    // Saving moves everything into the new list.
    saveRecord(record('new', 9));
    expect(localStorage.getItem(STORAGE_KEYS.liveInterview)).toBeNull();
    expect(loadHistory().map((x) => x.id)).toEqual(['new', 'old']);
  });

  it('drops the oldest transcripts first when storage is full', () => {
    saveRecord(record('a', 1, 50));
    saveRecord(record('b', 2, 50));
    const setItem = Storage.prototype.setItem;
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
      this: Storage,
      key: string,
      value: string
    ) {
      if (value.length > 6000) throw new DOMException('full', 'QuotaExceededError');
      return setItem.call(this, key, value);
    });
    expect(saveRecord(record('c', 3, 50))).toBe(true);
    spy.mockRestore();
    const list = loadHistory();
    expect(list.map((r) => r.id)).toEqual(['c', 'b', 'a']);
    expect(list[0].transcript).toHaveLength(50);
    expect(list[2].transcript).toBeUndefined();
  });
});
