Implement a class `MyPromise` that behaves like a native `Promise` for the core features. It's roughly the [Promises/A+](https://promisesaplus.com/) specification plus `catch`, `finally` and two static helpers.

```js
const p = new MyPromise((resolve) => setTimeout(() => resolve(2), 10));

p.then((n) => n * 10)
  .then((n) => {
    throw new Error(`got ${n}`);
  })
  .catch((e) => e.message) // 'got 20'
  .finally(() => console.log('done'))
  .then(console.log); // 'got 20'
```

## Requirements

**Constructor `new MyPromise(executor)`**

- Throws a `TypeError` if `executor` is not a function.
- Calls `executor(resolve, reject)` **synchronously**. If the executor throws, the promise rejects with the error, unless it was already resolved.
- Only the first call to `resolve` or `reject` has any effect.

**Resolution (`resolve(x)`)**

- If `x` is the promise itself, reject with a `TypeError`.
- If `x` is an object or function with a callable `then` (a **thenable**, including `MyPromise` and native promises), **adopt** its state: call `x.then(resolveFn, rejectFn)` in a later microtask, with a fresh pair of first-call-wins functions. If reading `then` throws, or calling it throws before settling, reject with that error.
- Otherwise fulfill with `x`.

**`then(onFulfilled, onRejected)`**

- Returns a **new** `MyPromise`.
- Callbacks always run **asynchronously** as microtasks (use `queueMicrotask`), even if the promise is already settled, and in the order they were registered.
- A non-function argument is ignored, and the value or reason passes through to the returned promise.
- The returned promise is resolved with the callback's return value (with the same adoption rules), or rejected if the callback throws.

**`catch(onRejected)`** is `then(undefined, onRejected)`.

**`finally(onFinally)`**

- Calls `onFinally()` with **no arguments** on either outcome.
- Passes the original value or reason through, **after** waiting for any promise `onFinally` returns.
- If `onFinally` throws or returns a rejected promise, the result rejects with that reason instead.

**Statics:** `MyPromise.resolve(value)` returns `value` itself if it is a `MyPromise`, otherwise a new `MyPromise` resolved with it. `MyPromise.reject(reason)` returns a new rejected `MyPromise`.

You may not use the native `Promise` inside `MyPromise`.

## Follow-up

- Why must `then` callbacks always be asynchronous, even for a promise that is already settled?
- How would you add `MyPromise.all`, and how would you detect unhandled rejections?
