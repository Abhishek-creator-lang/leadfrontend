import { STORAGE_KEYS } from '@/constants/storage';
import type { InterviewReport } from '@/utils/interview/engine';
import type { LiveInterviewConfig } from '@/utils/interview/plan';

/** Browser-only persistence for live interviews (config hand-off and past reports). */

export interface LiveInterviewRecord {
  id: string;
  at: number;
  config: LiveInterviewConfig;
  report: InterviewReport;
}

const HISTORY_LIMIT = 10;

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

export function loadHistory(): LiveInterviewRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.liveInterview);
    return raw ? (JSON.parse(raw) as LiveInterviewRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveRecord(record: LiveInterviewRecord) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.liveInterview,
      JSON.stringify([record, ...loadHistory()].slice(0, HISTORY_LIMIT))
    );
  } catch {
    // storage full or blocked
  }
}
