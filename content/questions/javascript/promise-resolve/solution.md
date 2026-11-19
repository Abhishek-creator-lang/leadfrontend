## Approach

There are two layers:

1. **The pass-through rule.** If `value instanceof Promise && value.constructor === Promise`, return `value` unchanged. This is why `Promise.resolve(p) === p`, and why calling it defensively on something that may already be a promise is cheap.
2. **Everything else.** Return `new Promise((resolve) => resolve(value))`. The `resolve` function that the `Promise` constructor hands you already implements thenable adoption exactly as the spec describes.

The final code is short. What the interviewer is testing is whether you can explain what `resolve(value)` does under the hood:

```js
// What the resolve function does when it receives `resolution`:
function resolveFn(resolution) {
  if (alreadyResolved) return;
  alreadyResolved = true;
  if (resolution === thisPromise) return reject(new TypeError('Chaining cycle'));
  if (resolution === null || (typeof resolution !== 'object' && typeof resolution !== 'function')) {
    return fulfill(resolution);
  }
  let then;
  try {
    then = resolution.then; // read exactly once, synchronously
  } catch (e) {
    return reject(e);
  }
  if (typeof then !== 'function') return fulfill(resolution);
  // NewPromiseResolveThenableJob: call `then` in a later microtask
  queueMicrotask(() => {
    const { resolve, reject } = createResolvingFunctions(thisPromise); // fresh "first call wins" pair
    try {
      then.call(resolution, resolve, reject);
    } catch (e) {
      reject(e); // ignored if resolve/reject was already called
    }
  });
}
```

Key details:

- `then` is **read once**. A getter-based `then` that changes between reads can't confuse the algorithm.
- `then` is **called in a microtask**. That protects the caller from a thenable that runs arbitrary code synchronously during `Promise.resolve`.
- The callbacks passed to `then` are a **fresh pair that only honours the first call**. A misbehaving thenable that calls both, or calls `resolve` then throws, can't settle the promise twice.
- Adoption is **recursive**. If the thenable resolves with another thenable, it's adopted too, so nested thenables flatten.

## Why adopt thenables?

Interoperability. Before ES2015, there were many promise libraries (Q, Bluebird, jQuery Deferred). Treating anything with a `then` method as a promise lets them all mix with native promises and `await`. The cost is that any object with a `then` method gets treated as a promise. A record such as `{ then: 'tomorrow' }` is fine because `then` isn't callable, but a class that happens to define a `then()` method will be "awaited" unexpectedly.

## Edge cases

- **Promise subclasses:** `value.constructor !== Promise`, so they're wrapped. The result is a different object that settles the same way.
- **Cross-realm promises** (from an iframe) fail `instanceof Promise` and are adopted as thenables. Same outcome, one extra hop. The spec's `IsPromise` check uses an internal slot instead of `instanceof`.
- **`null` / primitives:** fulfilled as-is. `Promise.resolve(undefined)` is the idiomatic "resolved, nothing to report".

## Microtask cost

Adopting a native promise through `resolve(p)` costs **two** extra microtask ticks: one for the thenable job, and one for `p.then`'s reaction. `await p` on a native promise is optimised to cost only one, because since ES2019 `await` uses `PromiseResolve`, which applies the same pass-through rule this question asks for. A nice consequence to mention: inside an `async` function, `return p` resolves the function's promise with `p` and pays the two-tick thenable adoption, while `return await p` pays only the one-tick `await`. So `return await` is no longer the "slower" form, and it also keeps the function in stack traces and lets a surrounding `try/catch` see the rejection.

## Common mistakes

- **Always wrapping**, which breaks `promiseResolve(p) === p`.
- **Hand-rolling adoption by calling `value.then(resolve, reject)` synchronously.** It runs third-party code synchronously, reads `then` twice, and doesn't guard against double settlement.
- **Checking `value instanceof Promise` only.** That returns subclass instances as-is, which native `Promise.resolve` doesn't do.
