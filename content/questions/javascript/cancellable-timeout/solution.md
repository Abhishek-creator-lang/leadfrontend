## Approach

Start the timer, keep its id in a closure, and return a function that clears it:

```js
const timerId = setTimeout(callback, delay, ...args);
return () => clearTimeout(timerId);
```

`clearTimeout` is defined to do nothing for an id that has already fired or been cleared, so the "no-op after run / when called twice" requirements come for free.

`setTimeout` forwards any extra arguments to the callback in both browsers and Node. Writing `setTimeout(() => callback(...args), delay)` is equivalent and makes the forwarding explicit.

## Complexity

O(1) time and space.

## Why a cancel function?

- **Encapsulation.** The caller doesn't need to know which clear function pairs with which id type. In Node, `setTimeout` returns a `Timeout` object rather than a number. The closure hides that.
- **Uniform cleanup.** Many APIs return "unsubscribe" or "dispose" functions: event emitters, store subscriptions, observables. A list of cleanups can be called the same way: `cleanups.forEach((fn) => fn())`.
- **It fits React exactly.** An effect's cleanup is just a function:

```js
useEffect(() => setCancellableTimeout(() => setVisible(false), 3000), []);
```

  The effect returns the cancel function, so React clears the timer on unmount or before re-running the effect.

## Edge cases

- **`delay` omitted:** default to 0. The callback still runs asynchronously, in a later macrotask.
- **Cancel from inside the callback:** harmless, since the timer already fired.
- **Errors thrown by `callback`:** surface as an uncaught exception in the timer task, same as with `setTimeout`. Wrapping it would hide bugs.

## Common mistakes

- **`setTimeout(callback(...args), delay)`**, which calls the callback immediately.
- **Returning `timerId`** instead of a function, which ignores the requirement.
- **Tracking a `cancelled` flag but never clearing the timer.** The callback is skipped, but the timer still occupies the queue and, in Node, keeps the process alive until it fires.

## Follow-ups

- **Promise version:** combine with `sleep`, returning `{ promise, cancel }`, or accept an `AbortSignal`.
- **Return value:** some variants return a `{ cancel, flush }` pair, where `flush` runs the callback now and clears the timer. That is the same idea as `debounce.flush`.
