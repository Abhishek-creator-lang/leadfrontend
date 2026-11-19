/** `pluralize(1, 'day')` → `"1 day"`, `pluralize(3, 'day')` → `"3 days"`. */
export const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

/** `https://example.com/a` → `example.com/a` (for compact link labels). */
export const stripProtocol = (url: string) => url.replace(/^https?:\/\//, '');

export const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
