/** `YYYY-MM-DD` (UTC) — the key format used for daily activity. */
export const toISODate = (d: Date = new Date()) => d.toISOString().slice(0, 10);

const DATE_TIME = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' });
const DATE = new Intl.DateTimeFormat('en', { dateStyle: 'medium' });

/** "Nov 20, 2026, 9:41 AM", or an em dash when missing. */
export const formatDateTime = (d?: Date | string | null) =>
  d ? DATE_TIME.format(new Date(d)) : '—';

/** "Nov 20, 2026", or an em dash when missing. */
export const formatDate = (d?: Date | string | null) => (d ? DATE.format(new Date(d)) : '—');
