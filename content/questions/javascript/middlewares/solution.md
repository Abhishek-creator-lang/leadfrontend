## Approach: a recursive `dispatch(i)`

Each call to `run` creates its own `dispatch(i)` function, which means "run middleware `i` and everything after it":

```js
function dispatch(i) {
  if (i <= lastCalled) return Promise.reject(new Error('next() called multiple times'));
  lastCalled = i;
  const fn = i === middlewares.length ? finalNext : middlewares[i];
  if (!fn) return Promise.resolve();
  try {
    return Promise.resolve(fn(context, () => dispatch(i + 1)));
  } catch (err) {
    return Promise.reject(err);
  }
}
return dispatch(0);
```

1. Middleware `i` receives `next = () => dispatch(i + 1)`. Calling it starts the next layer and returns that layer's promise, so `await next()` waits for **everything downstream**.
2. `Promise.resolve(...)` normalises sync middlewares and the `try/catch` turns synchronous throws into rejections. This is what makes `try { await next() } catch {}` work in an upstream error-handling middleware.
3. Past the end of the array, call the optional `finalNext`, or resolve immediately.

### Detecting a double `next()`

`lastCalled` tracks the highest index dispatched in **this run**. When middleware `i` calls `next()` the first time, `dispatch(i + 1)` sets `lastCalled = i + 1` (and downstream layers push it higher). A second call to `dispatch(i + 1)` finds `i + 1 <= lastCalled` and rejects. Calling `next` twice would otherwise run the downstream handlers twice, sending a response twice or charging a card twice.

The counter must live inside `run`, not in `compose`. Otherwise two concurrent requests would share it and trip each other's check.

## Complexity

O(n) calls per run and O(n) promise depth on the call stack. Each `next()` adds a frame, so thousands of middlewares could get deep, but real stacks have tens.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `next` that doesn't return the downstream promise | `await next()` returns immediately; "after" code runs too early |
| No `try/catch` around the call | A synchronous throw escapes as an exception instead of a rejection |
| Storing the index in `compose`'s closure | Concurrent runs corrupt each other |
| Running middlewares with `for` + `await` | No "after" phase; it's a series, not an onion |
| Forgetting `Promise.resolve` for sync middleware | `next()` sometimes returns `undefined` |

## Express vs Koa vs Redux

- **Express** (classic): `(req, res, next)`, where `next` returns nothing, so there's no "after" phase you can await. Errors go through `next(err)` to special 4-argument error handlers. Express 5 additionally catches rejected promises from async handlers.
- **Koa:** the async onion above. `koa-compose` is essentially this function; error handling is just `try/catch` around `await next()`.
- **Redux:** `const middleware = (store) => (next) => (action) => { ...; return next(action); }`. It's the same "wrap the rest of the pipeline" idea, built by function composition at store-creation time instead of on every call. `applyMiddleware` does `compose(...chain)(store.dispatch)`.
- **Others:** Axios interceptors, Apollo Link and Next.js middleware are all variations of this.

## A timeout middleware

```js
const timeout = (ms) => async (ctx, next) => {
  let timer;
  const expired = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Timeout')), ms);
  });
  try {
    await Promise.race([next(), expired]);
  } finally {
    clearTimeout(timer);
  }
};
```

The downstream work keeps running after a timeout unless it observes an `AbortSignal` placed on `ctx`, which is worth saying in an interview.

## Follow-ups

- **Error middleware placement:** to catch everything, error handlers must come **first** in Koa (they wrap the rest), but **last** in Express.
- **Conditional middleware:** `unless(predicate, mw)` wraps a middleware and calls `next()` directly when the predicate matches.
- **Router composition:** a router is itself a middleware that dispatches to a nested `compose`d stack.
