## Architecture

A promise is a small state machine plus a queue of reactions:

| Field | Meaning |
|---|---|
| `state` | `'pending'`, then exactly one transition to `'fulfilled'` or `'rejected'` |
| `value` | the fulfillment value or rejection reason |
| `handlers` | reactions registered while pending: `{ onFulfilled, onRejected, resolve, reject }` |

The solution keeps these in **private class fields** (`#state`, `#value`, `#handlers`) so outside code can't tamper with them, much like the internal slots of a native promise.

## The three core operations

### 1. Resolving functions (first call wins)

`#createResolvingFunctions()` returns a `resolve`/`reject` pair sharing one `alreadyResolved` flag. This is subtler than checking `state !== 'pending'`. After `resolve(thenable)` the promise is still pending while it waits for the thenable, but a later `reject()` must already be ignored. The flag captures "a decision has been made", while `state` captures "the outcome is known".

### 2. Resolution procedure

```
resolveWith(x):
  x === this                    -> reject(TypeError)   // cycle
  x is object/function:
     then = x.then  (throws?    -> reject(error))
     then is callable           -> queueMicrotask: then.call(x, fresh resolve, fresh reject)
  otherwise                     -> fulfill(x)
```

- `then` is **read once**, because a getter could return different values on each read.
- The call happens in a **microtask**, so foreign code never runs synchronously inside `resolve`.
- A **fresh** first-call-wins pair protects against thenables that call both callbacks or throw after resolving.
- This one procedure handles `MyPromise`, native `Promise` and arbitrary thenables. They're all just thenables.

### 3. Reactions (`then`)

`then` creates the child promise and captures **its** `resolve`/`reject` in a handler record. When the parent settles (or immediately, if it already has), the handler is scheduled with `queueMicrotask`:

- Pick `onFulfilled` or `onRejected` based on the state.
- If it isn't a function, **pass through**: resolve or reject the child with the same value. This is what lets `.then(f).catch(g)` route a rejection past `f` to `g`.
- Otherwise call it. A return value goes to the child's `resolve` (so returned promises are adopted), and a throw goes to the child's `reject`.

Registration order is preserved because pending handlers are kept in an array and flushed in order, and each schedules its own microtask in sequence.

## `finally`

```js
finally(onFinally) {
  return this.then(
    (value) => MyPromise.resolve(onFinally()).then(() => value),
    (reason) => MyPromise.resolve(onFinally()).then(() => { throw reason; }),
  );
}
```

It waits for `onFinally`'s promise, then re-emits the original outcome. If `onFinally` throws, the throw happens inside the `then` callback, so the result rejects with the new error. If `onFinally` isn't a function, it's passed straight to `then` and both outcomes pass through.

## Why callbacks must be asynchronous

If `then` ran callbacks synchronously for settled promises, the same code would behave differently depending on timing:

```js
let ready = false;
p.then(() => console.log(ready));
ready = true;
```

This would log `false` for a settled `p` and `true` for a pending one. Always deferring (the "never release Zalgo" rule) makes ordering predictable. Using **microtasks** rather than `setTimeout` means reactions run before the next render or I/O event, which is what native promises do.

## Complexity

`then` is O(1). Settling is O(h) for h registered handlers. Memory: each pending promise holds its handlers until it settles.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Using `setTimeout` for reactions | Works, but ordering differs from native promises (they'd run after timers) |
| Calling callbacks synchronously when already settled | Inconsistent ordering ("Zalgo") |
| Checking `state` instead of an `alreadyResolved` flag | `resolve(slowThenable); reject(err)` wrongly rejects |
| No pass-through for missing callbacks | `.then(f).catch(g)` never reaches `g` |
| Treating only `instanceof MyPromise` as adoptable | Native promises and other libraries' thenables aren't unwrapped |
| No self-resolution check | `p.then(() => p2)` where `p2` is the child hangs forever |
| `finally` passing the value to `onFinally` | Diverges from the spec, since `onFinally` gets no arguments |

## Follow-ups

- **`MyPromise.all`, `race`, etc.:** they are plain functions built on `then` (see the `promise-all` question), using `this` as the constructor so subclasses work.
- **Unhandled rejection tracking:** when a promise rejects with no handlers, schedule a check (for example a macrotask). If no handler was attached by then, report it. Attaching one later should fire a "handled" event. That's how browsers implement `unhandledrejection` and `rejectionhandled`.
- **Async/await:** `await x` is roughly `MyPromise.resolve(x).then(resume, throwInto)` for the suspended function. Because `MyPromise` is a thenable, native `await` already works with it, with one extra microtask hop for adoption.
- **Testing against the spec:** the official `promises-aplus-tests` npm package runs the full Promises/A+ conformance suite. You only need a small adapter that exposes `resolved`, `rejected` and `deferred` (a `withResolvers`-style helper) for your class.
