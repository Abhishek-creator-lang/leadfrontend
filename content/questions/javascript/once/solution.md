## Approach

Keep two pieces of state in the closure: a `done` flag and the cached `result`.

```js
if (done) return result;
done = true;
try {
  result = func.apply(this, args);
} catch (err) {
  done = false; // the failed attempt does not count
  throw err;
}
return result;
```

### Why set `done` *before* calling `func`?

If `func` (directly or indirectly) calls the wrapper again while it is running, a flag set afterwards would let the re-entrant call run `func` a second time and could recurse forever. Setting it first makes re-entrant calls return the current `result` (still `undefined` at that point) instead. The `catch` block resets the flag so that a failure can be retried.

### Why a separate flag instead of `result !== undefined`?

`func` may legitimately return `undefined`, `null`, `0` or `''`. Using the result as the "has run" signal would call `func` again every time.

## Complexity

O(1) time and space per call.

## Edge cases

- **`undefined` result:** cached like any other value.
- **Throwing `func`:** the error reaches the caller, and the next call retries.
- **`this`:** forwarded on the call that actually runs.
- **Memory:** once the result is cached you can drop the reference to `func` (`func = null`) so that a large closure can be garbage-collected. lodash does this.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `if (!result)` as the guard | Falsy results trigger repeated calls |
| A shared module-level flag | Every wrapper shares one "called" state |
| Arrow function wrapper | `this` cannot be forwarded |
| Setting the flag after the call | Re-entrant calls run `func` twice |
| Never resetting on throw (if your spec requires retry) | A transient failure permanently breaks initialisation |

## Follow-ups

- **`before(n, func)`:** use a counter instead of a boolean, and keep returning the last result after the limit.
- **Async once:** cache the *promise*, not the resolved value, so that concurrent callers share one request. Attach a `.catch` that clears the cache so a rejected attempt can be retried.
- **DOM equivalent:** `addEventListener(type, handler, { once: true })` removes the listener after the first event.
- **React:** a `useRef` flag inside an effect is the usual "run once per mount" idiom. In Strict Mode, React deliberately mounts components twice in development, which surfaces code that is not idempotent.
