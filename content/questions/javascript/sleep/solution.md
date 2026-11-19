## Approach

Wrap `setTimeout` in a promise:

```js
const sleep = (duration = 0) => new Promise((resolve) => setTimeout(resolve, duration));
```

`setTimeout` schedules `resolve` as a macrotask after the delay. `await sleep(ms)` suspends only the current `async` function. Its continuation is queued once the promise fulfills, and in the meantime the event loop runs other code.

One subtlety: `setTimeout(resolve, ms)` calls `resolve()` with **no arguments** in browsers, so the value is `undefined`. Node's `setTimeout` also passes no extra arguments by default. Writing `setTimeout(() => resolve(), ms)` makes that explicit and is equally good.

## Complexity

O(1). One timer per call.

## Timing guarantees

The delay is a **minimum**, not exact:

- Timers fire only when the call stack is empty and earlier tasks have run, so a busy main thread delays them.
- Browsers clamp nested timers (5 levels deep) to at least 4 ms and throttle timers in background tabs, often to 1 second or more.
- Durations above 2³¹−1 ms (about 24.8 days) overflow and fire almost immediately.

Tests should therefore assert `elapsed >= duration - small tolerance`, never equality.

## Why there's no blocking sleep

JavaScript on the main thread is single-threaded and event-driven. A blocking sleep would have to spin:

```js
function blockingSleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {} // burns CPU and freezes the UI
}
```

While it spins, no rendering, input, or network callbacks can run. The page is frozen. (Inside a **Web Worker** you can block with `Atomics.wait` on a `SharedArrayBuffer`, because a worker has no UI to freeze. On the main thread `Atomics.wait` is disallowed.)

## Common mistakes

- **`setTimeout(resolve(), ms)`.** It calls `resolve` immediately and passes `undefined` as the callback.
- **Expecting `sleep` without `await`** to pause: `sleep(1000); doNext();` runs `doNext` immediately.
- **Using `sleep` in a `forEach`.** `arr.forEach(async (x) => { await sleep(100); ... })` doesn't wait between items, because `forEach` ignores the returned promises. Use `for...of` with `await`.
- **Polling with `sleep` in a tight loop** when an event or callback is available. Prefer reacting to the event.

## Follow-ups

- **Cancellable sleep:** accept an `AbortSignal`. On `abort`, `clearTimeout` and reject with `signal.reason`. Remove the abort listener when the timer fires, so long-lived signals don't accumulate listeners.
- **Node:** `import { setTimeout as sleep } from 'node:timers/promises'` is the built-in, and it already supports `{ signal }`.
- **Testing code that sleeps:** inject the sleep function, or use fake timers, so tests don't wait in real time.
