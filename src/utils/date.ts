/** `YYYY-MM-DD` (UTC) — the key format used for daily activity. */
export const toISODate = (d: Date = new Date()) => d.toISOString().slice(0, 10);
