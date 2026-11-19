## TL;DR

Create an **`AbortController`**, pass its **`signal`** to `fetch(url, { signal })`, and call **`controller.abort()`** to cancel. The fetch promise rejects with a `DOMException` named **`AbortError`** (or with the reason you pass to `abort(reason)`). Signals are a general cancellation primitive: they also remove event listeners, and can be combined with **`AbortSignal.timeout()`** and **`AbortSignal.any()`**.

## Basic usage

```js
const controller = new AbortController();

fetch('/api/search?q=react', { signal: controller.signal })
  .then((r) => r.json())
  .then(render)
  .catch((err) => {
    if (err.name === 'AbortError') return; // cancelled on purpose
    showError(err);
  });

// later, e.g. user navigates away
controller.abort();
```

Aborting also cancels reading the body. If you abort while `res.json()` is still streaming, that promise rejects too.

## Common patterns

**Cancel the previous request (search-as-you-type):**

```js
let current;
async function search(q) {
  current?.abort();
  current = new AbortController();
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: current.signal });
  return res.json();
}
```

This prevents **race conditions** where a slow response for "re" overwrites the result for "react".

**Timeouts without manual timers:**

```js
const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
// rejects with a DOMException named 'TimeoutError', not 'AbortError'
```

**Combine user cancellation and timeout:**

```js
const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]);
```

**React effects:**

```js
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/items/${id}`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setItem)
    .catch((e) => { if (e.name !== 'AbortError') setError(e); });
  return () => controller.abort();
}, [id]);
```

In Strict Mode development, the effect runs, cleans up and runs again, so you will see one aborted request in DevTools. That's expected.

**One signal, many cleanups:**

```js
const ac = new AbortController();
window.addEventListener('resize', onResize, { signal: ac.signal });
document.addEventListener('keydown', onKey, { signal: ac.signal });
ac.abort(); // removes both listeners
```

## Making your own APIs abortable

```js
function delay(ms, { signal } = {}) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const id = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(id);
      reject(signal.reason);
    }, { once: true });
  });
}
```

Use `signal.aborted`, `signal.reason` and `signal.throwIfAborted()` inside long-running loops too.

## Pitfalls

- **A controller is single-use.** Once aborted, its signal stays aborted. Create a new controller for each request.
- **Aborting does not undo server work.** The server may already have processed a `POST`. Cancellation is a client concern; make mutations idempotent.
- **Don't treat aborts as errors** in UI or logging. Check `err.name` (`AbortError`, `TimeoutError`) or compare `err === signal.reason`.
- Calling `abort()` after the response has fully been read does nothing.

## In an interview, mention…

- Cancellation fixes stale-response races and wasted bandwidth, and it's the standard cleanup in effects.
- `AbortSignal.timeout` and `AbortSignal.any` (widely available since 2023–2024) remove most hand-written timeout code.
- The same signal works for `addEventListener`, many Node APIs and libraries like TanStack Query, which passes a signal to your query function.
