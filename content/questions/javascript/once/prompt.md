Implement `once(func)`. It returns a wrapper that calls `func` the **first** time it is called. Every later call skips `func` and returns the value from that first successful call.

This is useful for lazy initialisation: connecting to a socket, registering a service worker, or loading an SDK exactly once, however many code paths ask for it.

```js
let count = 0;
const init = once((name) => {
  count++;
  return `ready: ${name}`;
});

init('a'); // 'ready: a'
init('b'); // 'ready: a'  -> func is not called again; the argument is ignored
count;     // 1
```

## Requirements

- On the first call, invoke `func` with the call's **arguments** and **`this`**, and return its result.
- Every later call returns that same result, even if it is `undefined`, without calling `func`.
- **If `func` throws, the error propagates and the call does not count.** The next call tries again. (This differs from lodash's `once`, which treats a throwing call as used.)
- Each `once(...)` wrapper is independent of other wrappers.

## Follow-up

- How would you generalise this to `before(n, func)` (allow at most n − 1 calls)?
- What should happen if `func` calls the wrapper recursively during its first run?
- How would you build an async `once` that shares one in-flight promise but retries after a rejection?
