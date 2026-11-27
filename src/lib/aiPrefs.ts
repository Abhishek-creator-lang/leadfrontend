import { STORAGE_KEYS } from '@/constants/storage';

/** The user's on-device AI switch, remembered in this browser. On unless turned off. */
export function loadAIEnabled(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.aiPrefs);
    return raw ? (JSON.parse(raw) as { enabled?: boolean }).enabled !== false : true;
  } catch {
    return true;
  }
}

export function saveAIEnabled(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEYS.aiPrefs, JSON.stringify({ enabled }));
  } catch {
    // storage blocked: the switch still works for this visit
  }
}
