## TL;DR

A promise is always in one of **three states**: **pending** (not settled yet), **fulfilled** (has a value) or **rejected** (has a reason). Fulfilled and rejected are together called **settled**, and settling happens **at most once**: after that the state and value never change. A related but different term is **resolved**: a promise is resolved once its fate is *locked in*, which can be while it's still pending because it is following another promise.

## The state machine

```
          resolve(value)
pending ─────────────────▶ fulfilled (value)
   │
   └──── reject(reason) ─▶ rejected (reason)
```

```js
const p = new Promise((resolve, reject) => {
  resolve('first');
  reject(new Error('ignored'));  // no effect, already settled
  resolve('also ignored');
});
p.then(console.log); // 'first'
```

Every extra call to `resolve` or `reject` is silently ignored. That guarantee is what makes promises trustworthy compared to callbacks, which might be invoked twice.

## Resolved is not the same as fulfilled

```js
const slow = new Promise((r) => setTimeout(() => r('done'), 1000));
const follower = new Promise((resolve) => resolve(slow));
// follower is "resolved" (locked to slow) but still *pending* for a second,
// then fulfils with 'done'. If slow rejected, follower would reject too.
```

- `resolve(x)` with a non-thenable → fulfilled immediately with `x`.
- `resolve(thenable)` → follows the thenable's eventual state.
- `reject(reason)` → rejected immediately, even if `reason` is a promise (it's not unwrapped).

## Observing state

JavaScript deliberately has **no synchronous API** to read a promise's state. You can only react with `.then`/`.catch`. DevTools shows `[[PromiseState]]` and `[[PromiseResult]]` for debugging. If you need to know the state in code, track it yourself:

```js
function track(promise) {
  const state = { status: 'pending' };
  promise.then(
    (value) => Object.assign(state, { status: 'fulfilled', value }),
    (reason) => Object.assign(state, { status: 'rejected', reason }),
  );
  return state;
}
```

React's `use()` and Suspense libraries do something similar: they attach `status`/`value` fields to the promise so a re-render can read the result synchronously.

`Promise.allSettled` reports final states explicitly:

```js
const results = await Promise.allSettled([fetchA(), fetchB()]);
// [{ status: 'fulfilled', value: … }, { status: 'rejected', reason: … }]
```

## Handlers on settled promises

Attaching `.then` after settlement still works. The handler is queued as a microtask and gets the stored value:

```js
const done = Promise.resolve(42);
setTimeout(() => done.then(console.log), 1000); // logs 42 a second later
```

This is why promises are great for **caching**: store the promise itself (`cache.set(url, fetchJson(url))`), and every caller, early or late, gets the same result without duplicate requests. Remember to delete the entry on rejection so failures aren't cached forever.

## Pitfalls

- A promise that's never settled stays **pending forever**, and any `await` on it hangs. Add timeouts for external operations.
- A rejected promise with no handler triggers an **unhandled rejection** warning. Handlers attached later cause a `rejectionhandled` event.
- "Pending" doesn't mean "running". The promise is just a container; the work is done by whatever will call `resolve`.

## In an interview, mention…

- Three states, settled once, immutable value or reason.
- The difference between *resolved* and *fulfilled*.
- No synchronous state inspection by design, and practical uses: caching promises and `allSettled` status objects.
