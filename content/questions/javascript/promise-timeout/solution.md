## Approach

Create the result promise yourself and let two sources compete to settle it:

1. A timer that rejects with a `TimeoutError` after `duration` ms.
2. The input, normalised with `Promise.resolve(promise)`, which forwards its value or reason **and clears the timer**.

```js
return new Promise((resolve, reject) => {
  const timerId = setTimeout(() => reject(createTimeoutError(duration)), duration);
  Promise.resolve(promise).then(
    (value) => { clearTimeout(timerId); resolve(value); },
    (reason) => { clearTimeout(timerId); reject(reason); },
  );
});
```

"First one wins" comes for free: a promise settles only once, so whichever side calls first decides the outcome and the other call is ignored.

### Why not just `Promise.race([promise, timeoutPromise])`?

That works for the result, but the timer is never cleared when the input wins. In Node a pending timer keeps the process alive, in tests it can fire after the test ends, and in a long-running app thousands of these add up. If you use `race`, add `.finally(() => clearTimeout(timerId))`. The hand-written version above clears the timer in the same place it forwards the result.

### The error object

```js
const error = new Error(`Promise timed out after ${duration}ms`);
error.name = 'TimeoutError';
```

A real `Error` keeps a stack trace. A distinct `name` lets callers tell a timeout apart from a real failure (`if (e.name === 'TimeoutError') showRetry()`). This matches the `DOMException` name that `AbortSignal.timeout()` uses. A `class TimeoutError extends Error` is an equally good answer.

## Complexity

O(1) space and work. One timer and one reaction per call.

## Edge cases

- **Already-settled input with `duration = 0`:** the input wins, because its `.then` reaction is a microtask and the timer is a macrotask.
- **Input rejects in time:** you get the original reason. Wrapping it in a timeout error would hide the real cause.
- **Late settlement:** after a timeout, the input may still fulfill. The result is already rejected, so that's ignored. If the input **rejects** late, its rejection has a handler (ours), so no unhandled-rejection warning.
- **Negative or `NaN` durations:** `setTimeout` treats them as 0.

## Common mistakes

- **Not clearing the timer** (see above).
- **Rejecting with a string** (`reject('timeout')`), which has no stack and no type to branch on.
- **Calling `promise.then` directly**, which crashes on plain values.
- **Believing the operation was cancelled.** A timeout only stops *waiting*.

## Cancelling the underlying work

Promises have no cancellation, so you must pass a signal into the operation itself:

```js
async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timerId);
  }
}
// Modern runtimes: fetch(url, { signal: AbortSignal.timeout(ms) })
```

Combine it with a user-initiated cancel through `AbortSignal.any([userSignal, AbortSignal.timeout(ms)])`.

## Testing

Use fake timers (`jest.useFakeTimers()` / `vi.useFakeTimers()`) and advance the clock, or inject the timer functions (`promiseTimeout(p, ms, { setTimeout, clearTimeout })`). Then a test can also assert that `clearTimeout` was called when the input wins.
