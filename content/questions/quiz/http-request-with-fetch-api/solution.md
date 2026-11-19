## TL;DR

Call `fetch(url, options)`. It returns a **promise that resolves to a `Response` as soon as headers arrive**, then you read the body with `response.json()`, `.text()`, `.blob()` etc. (another promise). The key gotcha: **`fetch` only rejects on network failure or abort, not on HTTP 4xx/5xx**, so always check `response.ok`.

## GET

```js
async function getUser(id, { signal } = {}) {
  const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!res.ok) {
    throw new Error(`GET /users/${id} failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
```

## POST with JSON

```js
const res = await fetch('/api/todos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Write tests' }),
  credentials: 'same-origin', // default; 'include' sends cookies cross-origin
});
```

Other body types set their own `Content-Type` automatically: `FormData` (multipart, **don't** set the header yourself or you lose the boundary), `URLSearchParams` (`application/x-www-form-urlencoded`), `Blob`, and `ReadableStream`.

Build query strings safely:

```js
const url = new URL('/api/search', location.origin);
url.searchParams.set('q', query);
url.searchParams.set('page', '2');
await fetch(url);
```

## Useful options

| Option | Purpose |
|---|---|
| `method`, `headers`, `body` | The request itself |
| `signal` | Cancellation via `AbortController` / `AbortSignal.timeout(ms)` |
| `credentials` | `omit`, `same-origin` (default), `include` |
| `mode` | `cors` (default), `same-origin`, `no-cors` (opaque response) |
| `cache` | `default`, `no-store`, `reload`, `no-cache`, `force-cache` |
| `keepalive` | Let a small request outlive the page (analytics on unload) |
| `priority` | `high` / `low` / `auto` hint (Fetch Priority) |

## Timeouts and cancellation

```js
const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
// rejects with a 'TimeoutError' DOMException after 5s

const ctrl = new AbortController();
fetch(url, { signal: ctrl.signal }).catch((e) => {
  if (e.name === 'AbortError') return; // user navigated away
  throw e;
});
ctrl.abort();
```

`AbortSignal.any([a, b])` combines a user-cancel signal with a timeout.

## Pitfalls

- **Not checking `res.ok`.** A 404 resolves normally.
- **Reading the body twice.** Bodies are streams; use `res.clone()` if two consumers need it.
- **`res.json()` on an empty 204** throws a `SyntaxError`.
- **CORS errors** show as a generic `TypeError: Failed to fetch`; the real reason is only in DevTools.
- **Race conditions** when a newer request resolves before an older one (e.g. search-as-you-type). Abort the previous request or ignore stale responses.
- **No upload progress events.** `fetch` lacks them; use XHR for upload progress or stream the response for download progress.

## In an interview, mention…

- Two-step promise (headers, then body) and why `ok` must be checked.
- Abort/timeouts with `AbortSignal`, and handling races.
- A thin wrapper (base URL, auth header, error normalisation, retries with backoff) rather than raw `fetch` scattered across the app, or a data layer like TanStack Query for caching and dedupe.
