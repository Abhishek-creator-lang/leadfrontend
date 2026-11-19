// Mock paginated endpoint. Stands in for something like GET /api/posts?cursor=<cursor>&limit=10,
// which would return { items, nextCursor } as JSON. Uses cursor (not page-number) pagination and
// honours AbortSignal like fetch(). Set `mockOptions.failRate` (0–1) to simulate flaky network errors.

export const mockOptions = { failRate: 0, delay: 60 };

const TOTAL = 34;
const AUTHORS = ['Asha', 'Bruno', 'Chen', 'Dara', 'Elif', 'Femi'];
const TOPICS = ['shipped a new build', 'fixed a flaky test', 'wrote an RFC', 'paired on a bug', 'reviewed a PR', 'gave a demo'];

const POSTS = Array.from({ length: TOTAL }, (_, i) => ({
  id: `post-${i + 1}`,
  author: AUTHORS[i % AUTHORS.length],
  title: `Post #${i + 1}`,
  body: `${AUTHORS[i % AUTHORS.length]} ${TOPICS[(i * 5) % TOPICS.length]} today.`,
}));

export function fetchPosts({ cursor = null, limit = 10, signal } = {}) {
  return new Promise((resolve, reject) => {
    const abortError = () => Object.assign(new Error('Aborted'), { name: 'AbortError' });
    if (signal?.aborted) return reject(abortError());

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      if (Math.random() < mockOptions.failRate) return reject(new Error('Network error'));
      const start = cursor ? POSTS.findIndex((p) => p.id === cursor) + 1 : 0;
      const items = POSTS.slice(start, start + limit);
      const last = items[items.length - 1];
      resolve({ items, nextCursor: start + limit < TOTAL && last ? last.id : null });
    }, mockOptions.delay);

    function onAbort() {
      clearTimeout(timer);
      reject(abortError());
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
