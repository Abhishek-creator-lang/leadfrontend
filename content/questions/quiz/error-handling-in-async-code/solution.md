## TL;DR

With **`async`/`await`**, wrap awaited calls in **`try/catch/finally`**. With promise chains, use **`.catch()`** (and `.finally()` for cleanup). **A `try/catch` around code that merely *schedules* a callback won't catch errors thrown later**, so errors must be handled inside the callback or turned into promise rejections. Add **global safety nets** (`unhandledrejection`, `window.onerror`, error boundaries) for logging, and remember that **`fetch` doesn't reject on HTTP errors**.

## The core patterns

```js
// async/await
async function saveProfile(data) {
  setSaving(true);
  try {
    const res = await fetch('/api/profile', { method: 'PUT', body: JSON.stringify(data) });
    if (!res.ok) throw new HttpError(res.status, await res.text());
    return await res.json(); // `return await` so a json() failure is caught here too
  } catch (err) {
    if (err.name === 'AbortError') return null;      // expected
    report(err);                                     // log with context
    throw new Error('Could not save profile', { cause: err }); // rethrow with context
  } finally {
    setSaving(false);                                // always runs
  }
}

// promise chain
loadData()
  .then(render)
  .catch(showErrorState)
  .finally(hideSpinner);
```

`Error` supports a **`cause`** option (ES2022), which keeps the original error when you wrap it in a more meaningful one.

## What `try/catch` can't catch

```js
try {
  setTimeout(() => { throw new Error('boom'); }, 0); // thrown later, on a different stack
} catch {
  // never runs
}

try {
  fetchData(); // not awaited: the rejection escapes
} catch {}
```

Fix: handle the error inside the callback, or promisify and `await` it.

## Callbacks and events

Node-style callbacks use the **error-first** convention (`(err, result) => { if (err) … }`). Event-based APIs signal errors via events (`xhr.onerror`, `ws.onerror`, `worker.onerror`). Convert them to promises at the boundary, so the rest of the code can use one style.

## Fetch specifics

`fetch` only rejects on **network failure, CORS problems or abort**. A 404 or 500 **fulfils**. Always check `res.ok`, and parse error bodies defensively (they may be HTML, not JSON).

## Multiple operations

- `Promise.all` rejects with the **first** error; others are ignored.
- `Promise.allSettled` gives you **every** outcome for per-item reporting.
- `Promise.any` rejects with an **`AggregateError`** whose `errors` array lists all failures.

## Retries with backoff

For transient errors (network blips, 503, 429), retry with exponential backoff and jitter, but only for **idempotent** operations:

```js
async function retry(fn, { attempts = 3, base = 300 } = {}) {
  for (let i = 0; ; i++) {
    try { return await fn(); }
    catch (err) {
      if (i >= attempts - 1 || !isTransient(err)) throw err;
      await new Promise((r) => setTimeout(r, base * 2 ** i + Math.random() * 100));
    }
  }
}
```

## Global safety nets

```js
window.addEventListener('unhandledrejection', (e) => report(e.reason));
window.addEventListener('error', (e) => report(e.error));
```

In Node, unhandled rejections **crash the process** by default (since Node 15). In React, **error boundaries** catch rendering errors, **but not** errors in event handlers or async code. Catch those yourself and set error state (or rethrow during render so a boundary can show it).

## Pitfalls

- **Swallowing errors:** `catch (e) {}` or `.catch(() => {})` hides bugs. At minimum log them.
- **Catching too broadly:** a single giant `try` around unrelated steps makes it unclear what failed. Catch where you can act.
- **Showing raw error messages to users.** Map errors to friendly messages, and log the details.
- **Not resetting UI state** (spinners, disabled buttons). That's what `finally` is for.

## In an interview, mention…

- `try/catch/finally` with `await`, `.catch` for chains, and why scheduling isn't covered by `try`.
- The `fetch` `res.ok` gotcha, `Error.cause` and `AggregateError`.
- Production concerns: retries for idempotent calls, user-facing error states, global handlers and error monitoring (Sentry etc.).
