import { STORAGE_KEYS } from '@/constants/storage';
import type { InterviewReport, Line, StageReport } from '@/utils/interview/engine';
import type { LiveInterviewConfig } from '@/utils/interview/plan';

/** Browser-only persistence for live interviews (config hand-off and past reports). */

export interface LiveInterviewRecord {
  id: string;
  at: number;
  config: LiveInterviewConfig;
  report: InterviewReport;
  /** Missing on records saved before reports kept the transcript. */
  transcript?: Line[];
  /** Saved by an older version: only the score, verdict and round scores are reliable. */
  legacy?: boolean;
}

export const HISTORY_LIMIT = 30;

export function saveConfig(config: LiveInterviewConfig) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.liveInterviewConfig, JSON.stringify(config));
  } catch {
    // storage blocked: the room falls back to defaults
  }
}

export function loadConfig(): LiveInterviewConfig | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.liveInterviewConfig);
    return raw ? (JSON.parse(raw) as LiveInterviewConfig) : null;
  } catch {
    return null;
  }
}

/** A report saved by the first version of the live interview (no breakdowns or details). */
interface V1Report {
  score: number;
  verdict: InterviewReport['verdict'];
  stages: { id: string; label: string; score: number | null }[];
  strengths?: string[];
  gaps?: string[];
  warmup?: Partial<InterviewReport['warmup'][number]>[];
  coding?: (Partial<NonNullable<InterviewReport['coding']>> & { notes?: unknown[] }) | null;
  design?: (Partial<NonNullable<InterviewReport['design']>> & { notes?: unknown[] }) | null;
  behavioral?: (Partial<InterviewReport['behavioral'][number]> & { notes?: unknown[] })[];
  hintsUsed?: number;
}

const toNotes = (notes: unknown[] | undefined) =>
  (notes ?? []).map((n) =>
    typeof n === 'string' ? { text: n, lost: 0 } : (n as { text: string; lost: number })
  );

/** Reads an old report into today's shape, filling what it never recorded with empty values. */
export function migrateV1Report(r: V1Report): InterviewReport {
  const stages: StageReport[] = r.stages
    .filter((s) => s.score !== null)
    .map((s) => ({
      id: s.id as StageReport['id'],
      label: s.label,
      status: 'completed' as const,
      score: s.score,
      weight: 0,
      breakdown: [],
    }));
  return {
    version: 2,
    completed: true,
    endedDuring: null,
    score: r.score,
    completedScore: null,
    verdict: r.verdict,
    stages,
    strengths: r.strengths ?? [],
    gaps: r.gaps ?? [],
    warmup: (r.warmup ?? []).map((w) => ({
      id: w.id ?? '',
      title: w.title ?? '',
      grade: w.grade ?? 'weak',
      hinted: Boolean(w.hinted),
      hints: w.hints ?? (w.hinted ? 1 : 0),
      score: w.score ?? 0,
      hit: w.hit ?? [],
      missing: w.missing ?? [],
      contradicted: w.contradicted ?? [],
      matched: w.matched ?? {},
      incorrect: w.incorrect ?? [],
      answer: w.answer ?? '',
      summary: w.summary ?? '',
      checkedBy: w.checkedBy ?? 'keywords',
    })),
    coding: r.coding
      ? {
          id: r.coding.id ?? '',
          title: r.coding.title ?? '',
          passed: r.coding.passed ?? 0,
          total: r.coding.total ?? 0,
          hints: r.coding.hints ?? 0,
          clarifications: r.coding.clarifications ?? 0,
          thinkAloud: r.coding.thinkAloud ?? 0,
          complexityCorrect: Boolean(r.coding.complexityCorrect),
          edgeAnswered: Boolean(r.coding.edgeAnswered),
          timedOut: Boolean(r.coding.timedOut),
          skipped: Boolean(r.coding.skipped),
          score: r.coding.score ?? 0,
          breakdown: r.coding.breakdown ?? [],
          notes: toNotes(r.coding.notes),
        }
      : null,
    design: r.design
      ? {
          id: r.design.id ?? '',
          title: r.design.title ?? '',
          steps: (r.design.steps ?? []).map((st) => ({
            ...st,
            answer: st.answer ?? '',
            notes: st.notes ?? '',
            reached: st.reached ?? true,
          })),
          pushbacks: (r.design.pushbacks ?? []).map((p) => ({ ...p, answer: p.answer ?? '' })),
          leadAnswered: r.design.leadAnswered ?? null,
          timedOut: Boolean(r.design.timedOut),
          hints: r.design.hints ?? 0,
          score: r.design.score ?? 0,
          breakdown: r.design.breakdown ?? [],
          notes: toNotes(r.design.notes),
        }
      : null,
    behavioral: (r.behavioral ?? []).map((b) => ({
      id: b.id ?? '',
      title: b.title ?? '',
      score: b.score ?? 0,
      answer: b.answer ?? '',
      hints: b.hints ?? 0,
      noStory: Boolean(b.noStory),
      signals: b.signals ?? { detail: false, ownership: false, result: false, reflection: false },
      breakdown: b.breakdown ?? [],
      notes: toNotes(b.notes),
    })),
    hintsUsed: r.hintsUsed ?? 0,
    hintsByRound: { warmup: 0, coding: 0, design: 0, behavioral: 0 },
    questionsAsked: 0,
    checkedBy: 'keywords',
    durationSec: null,
  };
}

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Past interviews, newest first. Records from the first version are migrated on read. */
export function loadHistory(): LiveInterviewRecord[] {
  const v2 = readJSON<LiveInterviewRecord[]>(STORAGE_KEYS.liveInterviewReports);
  const v1 = readJSON<(Omit<LiveInterviewRecord, 'report'> & { report: V1Report })[]>(
    STORAGE_KEYS.liveInterview
  );
  const list = Array.isArray(v2) ? v2.filter((r) => r?.report?.version === 2) : [];
  if (Array.isArray(v1)) {
    const ids = new Set(list.map((r) => r.id));
    for (const old of v1) {
      if (!old?.report || ids.has(old.id)) continue;
      list.push({ ...old, report: migrateV1Report(old.report), legacy: true });
    }
  }
  return list.sort((a, b) => b.at - a.at);
}

export const getRecord = (id: string) => loadHistory().find((r) => r.id === id) ?? null;

/**
 * Writes the list. When storage is full, drops transcripts from the oldest records first, then the
 * oldest records, until it fits.
 */
function write(list: LiveInterviewRecord[]): boolean {
  const records = list.slice(0, HISTORY_LIMIT).map((r) => ({ ...r }));
  for (;;) {
    try {
      localStorage.setItem(STORAGE_KEYS.liveInterviewReports, JSON.stringify(records));
      try {
        localStorage.removeItem(STORAGE_KEYS.liveInterview); // migrated into the new list
      } catch {
        // ignore
      }
      return true;
    } catch {
      const oldestWithTranscript = [...records].reverse().find((r) => r.transcript);
      if (oldestWithTranscript && records.indexOf(oldestWithTranscript) > 0)
        delete oldestWithTranscript.transcript;
      else if (records.length > 1) records.pop();
      else return false;
    }
  }
}

/** Saves (or replaces, by id) a record. */
export function saveRecord(record: LiveInterviewRecord): boolean {
  return write([record, ...loadHistory().filter((r) => r.id !== record.id)]);
}

export function deleteRecord(id: string): boolean {
  return write(loadHistory().filter((r) => r.id !== id));
}

export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEYS.liveInterviewReports);
    localStorage.removeItem(STORAGE_KEYS.liveInterview);
  } catch {
    // storage blocked
  }
}
