## TL;DR

**`fetch()`** is the modern, **promise-based** HTTP API built on `Request`/`Response` objects with **streaming bodies** and cancellation via **`AbortController`**. **`XMLHttpRequest`** is the older **event/callback-based** API. The practical differences are that **`fetch` only rejects on network failure (not on 404/500)**, it doesn't send cookies cross-origin unless you ask, and it has **no built-in upload-progress events**, which is the main remaining reason to use XHR.

## Side by side

```js
// XMLHttpRequest
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/user');
xhr.responseType = 'json';
xhr.onload = () => {
  if (xhr.status >= 200 && xhr.status < 300) render(xhr.response);
  else showError(xhr.status);
};
xhr.onerror = () => showError('network');
xhr.send();

// fetch
const res = await fetch('/api/user');
if (!res.ok) throw new Error(`HTTP ${res.status}`);
render(await res.json());
```

## Differences that matter

| | `XMLHttpRequest` | `fetch()` |
|---|---|---|
| Style | Events (`onload`, `onerror`, `onreadystatechange`) | Promises, works with `async`/`await` |
| HTTP errors | You check `status` | Resolves for any HTTP response; check `res.ok` |
| Cancellation | `xhr.abort()` | `AbortController` signal (also composable: `AbortSignal.timeout`, `AbortSignal.any`) |
| Timeout | `xhr.timeout` | `AbortSignal.timeout(ms)` |
| Response body | Whole body (or text progressively) | `ReadableStream` (`res.body`), so you can process chunks |
| Download progress | `progress` events | Read the stream and count bytes |
| Upload progress | `xhr.upload.onprogress` | Not available (streaming request bodies exist in Chromium only, with HTTP/2+ and `duplex: 'half'`) |
| Cookies | Same-origin by default; `withCredentials` for cross-origin | `credentials: 'same-origin'` default; `'include'` for cross-origin |
| Workers / service workers | Not in service workers | Everywhere, including service workers and Node 18+ |
| Sync mode | Deprecated sync option | Async only |
| Extras | | `keepalive` (send during page unload), `priority`, `cache`, `redirect`, `mode` |

## Pitfalls with fetch

- **Forgetting `res.ok`.** A 500 response resolves normally; your `catch` only sees DNS/CORS/offline failures and aborts.
- **The body can be read once.** Use `res.clone()` if two consumers need it.
- **`res.json()` on an empty or HTML error body throws** a `SyntaxError`, which hides the real HTTP error. Check status first.
- **CORS errors are opaque on purpose.** You get a `TypeError` with no detail; look in DevTools.
- An abort rejects with an `AbortError` `DOMException`. Filter it out so you don't show an error toast for intentional cancellation.

A small wrapper is common in real apps:

```js
async function http(url, { timeout = 10_000, signal, ...init } = {}) {
  const res = await fetch(url, {
    ...init,
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(timeout)]) : AbortSignal.timeout(timeout),
  });
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
  return res.status === 204 ? null : res.json();
}
```

## In an interview, mention…

- `fetch` is the default today; XHR remains for **upload progress** (or libraries like Axios that use it in browsers).
- The `res.ok` check and the credentials default are the two most common production bugs.
- Streaming responses (e.g. rendering LLM tokens as they arrive) are possible with `res.body.getReader()` and impossible to do cleanly with XHR.
