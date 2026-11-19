## Approach

```js
return new Promise((_, reject) => reject(reason));
```

That's the whole implementation. Unlike the executor's `resolve`, the `reject` function never inspects its argument. It just transitions the promise to `rejected` with that exact value. So:

- No `then` lookup and no thenable adoption.
- No pass-through. `Promise.reject(p)` never returns `p` itself, because the result must be a *rejected* promise and `p` may well be fulfilled.

## Why the asymmetry is intentional

Resolution means "my value is whatever this other thing eventually produces", so following a thenable makes sense. Rejection means "this operation failed, and here is the reason". If `reject` adopted promises, a failure could turn into a success (`reject(Promise.resolve(1))` would fulfill), which would make error handling unpredictable. The reason is data about the failure, not a pointer to another computation.

## Complexity

O(1).

## Edge cases

- **Promise as reason:** the rejection reason is the promise object. If the code never handles that inner promise and it later rejects, that is a separate unhandled rejection.
- **`undefined` reason:** allowed. `catch((e) => ...)` receives `undefined`, which makes debugging painful. That's one reason to always reject with an `Error`.
- **Unhandled rejections:** the returned promise is rejected immediately. If no handler is attached before the current microtask checkpoint, browsers fire `unhandledrejection` and Node logs a warning (or crashes, depending on `--unhandled-rejections`). Attaching a handler later fires `rejectionhandled`.

## Common mistakes

- **`return reason instanceof Promise ? reason : ...`**, copying the pass-through rule from `resolve`. That's wrong: a fulfilled promise would come back as fulfilled.
- **Using `resolve(thenable)` patterns**, or calling `reason.then`. `reject` must never touch the reason.
- **Throwing synchronously** instead of returning a rejected promise. Callers chaining `.catch` will miss it.

## Why reject with `Error` objects

- `Error`s carry a **stack trace**, which shows where the failure started. A string doesn't.
- Consumers can branch on type (`err instanceof AbortError`, `err.name === 'TimeoutError'`) and on `err.cause` (ES2022) for wrapped errors.
- Error monitoring tools (Sentry and similar) group and symbolicate by stack. A bare string shows up as an opaque "Non-Error promise rejection".

## Follow-up

- `async function f() { throw x; }` is equivalent to returning `Promise.reject(x)`. Inside `async` functions, prefer `throw`, which reads better and keeps the stack accurate.
