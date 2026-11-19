// Calendar-date helpers. Everything uses the *local* Date constructor (y, m, d), never
// `new Date('2026-03-15')`, which parses as UTC midnight and shows the previous day west of UTC.

const pad = (n) => String(n).padStart(2, '0');

export function toISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** 'YYYY-MM-DD' → local Date, or null if malformed or impossible (e.g. 2026-02-30). */
export function parseISO(text) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  // Date silently rolls Feb 30 over to Mar 2. Round-trip to reject it.
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null;
}

export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

/** Same day-of-month n months away, clamped to the target month's length (Jan 31 + 1 → Feb 28). */
export function addMonths(d, n) {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const day = Math.min(d.getDate(), daysInMonth(target.getFullYear(), target.getMonth()));
  return new Date(target.getFullYear(), target.getMonth(), day);
}

export const isSameDay = (a, b) =>
  Boolean(a && b) && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Weeks (Sunday-first) for the month containing `date`; null pads days outside the month. */
export function monthMatrix(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const leading = new Date(year, month, 1).getDay();
  const total = daysInMonth(year, month);
  const cells = [...Array(leading).fill(null)];
  for (let day = 1; day <= total; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
