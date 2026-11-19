// Mock search endpoint. Stands in for something like GET /api/countries?q=<query>&limit=8.
// It deliberately answers SHORT queries more slowly than long ones, so responses can arrive
// out of order (a classic race-condition trap), and it honours AbortSignal like fetch() does.

const COUNTRIES = [
  'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 'Brazil', 'Canada', 'Chile', 'China',
  'Colombia', 'Croatia', 'Denmark', 'Egypt', 'Estonia', 'Finland', 'France', 'Germany', 'Ghana', 'Greece',
  'Iceland', 'India', 'Indonesia', 'Ireland', 'Italy', 'Japan', 'Kenya', 'Malaysia', 'Mexico', 'Morocco',
  'Nepal', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Peru', 'Philippines', 'Poland',
  'Portugal', 'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland',
  'Thailand', 'Turkey', 'Uganda', 'Ukraine', 'United Kingdom', 'United States', 'Vietnam',
].map((name, i) => ({ id: `c${i}`, name }));

export function searchCountries(query, { signal, limit = 8 } = {}) {
  return new Promise((resolve, reject) => {
    const q = query.trim().toLowerCase();
    const delay = 60 + Math.max(0, 5 - q.length) * 40; // 60–260 ms; shorter query = slower
    const abortError = () => {
      const err = new Error('Aborted');
      err.name = 'AbortError';
      return err;
    };
    if (signal?.aborted) return reject(abortError());

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      if (q === 'error') return reject(new Error('Search service unavailable'));
      // Prefix matches rank above substring matches.
      const starts = COUNTRIES.filter((c) => c.name.toLowerCase().startsWith(q));
      const contains = COUNTRIES.filter((c) => !c.name.toLowerCase().startsWith(q) && c.name.toLowerCase().includes(q));
      resolve([...starts, ...contains].slice(0, limit));
    }, delay);

    function onAbort() {
      clearTimeout(timer);
      reject(abortError());
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
