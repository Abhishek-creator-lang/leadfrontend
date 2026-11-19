## Approach

The `Promise` constructor calls the executor **synchronously**, so you can copy `resolve` and `reject` out of it into outer variables before the constructor returns:

```js
let resolve;
let reject;
const promise = new Promise((res, rej) => {
  resolve = res;
  reject = rej;
});
return { promise, resolve, reject };
```

This "deferred" pattern predates the built-in. jQuery had `$.Deferred()`, and many codebases had a `createDeferred()` helper. ES2024 standardised it as `Promise.withResolvers()`.

The synchronous executor guarantee is the reason this works. If the executor were deferred, `resolve` would still be `undefined` when you returned the object.

## Complexity

O(1).

## Edge cases

- **Settling twice:** the second call is a no-op, which is standard promise behaviour. Nothing to implement.
- **Resolving with a promise:** `resolve(otherPromise)` makes `promise` follow it, because the same thenable adoption rules apply.
- **Detached functions:** `resolve` and `reject` don't depend on `this`, so you can pass them as callbacks (`emitter.once('ready', resolve)`).

## Common mistakes

- **Creating the promise lazily** or returning the functions from inside an async callback, which leaves them `undefined`.
- **Sharing a single deferred** across multiple requests, so later requests are silently ignored because the promise is already settled.
- **Forgetting to handle rejection.** If you call `reject` and nobody has attached a handler, you get an unhandled rejection.

## When it's the right tool

`new Promise(executor)` works well when **all** the settling logic fits inside the executor. `withResolvers` is better when the settle points live elsewhere:

1. **Bridging event-based APIs**, where the resolve happens in one listener and the reject in another, or in a cleanup function.
2. **Request/response over a channel:** a `postMessage` or WebSocket client keeps `Map<requestId, { resolve, reject }>`. When a response with that id arrives, it looks up the pair and settles it.
3. **Async queues and locks:** a waiter enqueues its `resolve`, and whoever releases the lock calls it.
4. **Tests:** creating a promise you control precisely, for example to assert a loading state before resolving a mocked fetch.

## Risks

- **Leaks:** a stored `resolve` that is never called keeps its promise, and everything awaiting it, alive. Pair every deferred with a timeout or an abort path, and remove map entries on settle.
- **Authority:** anyone holding `resolve` can settle the promise. Keep the functions private to the producer and hand consumers only `promise`.

## Follow-up

- In TypeScript the signature is `withResolvers<T>(): { promise: Promise<T>; resolve: (value: T | PromiseLike<T>) => void; reject: (reason?: any) => void }`. That is a good chance to show the generic.
- The native method is also generic over the receiver (`MyPromise.withResolvers()` creates a `MyPromise`). The polyfill could use `this` as the constructor to match.
