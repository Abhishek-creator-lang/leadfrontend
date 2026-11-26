/** Small display helpers for the live interview and its report. */

export type Verdict = { label: string; color: 'success' | 'info' | 'warning' | 'error' };

/** Hiring-style verdict for a 0–100 score. */
export function verdict(score: number): Verdict {
  if (score >= 85) return { label: 'Strong hire', color: 'success' };
  if (score >= 70) return { label: 'Hire', color: 'info' };
  if (score >= 50) return { label: 'Lean no hire', color: 'warning' };
  return { label: 'No hire', color: 'error' };
}

/** Seconds → "m:ss" (negative values get a leading minus). */
export function formatClock(seconds: number): string {
  const sign = seconds < 0 ? '-' : '';
  const s = Math.abs(seconds);
  return `${sign}${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
