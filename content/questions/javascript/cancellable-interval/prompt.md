Implement `setCancellableInterval(callback, delay, ...args)`. It works like `setInterval`, but returns a **cancel function** instead of an interval id. After the cancel function is called, `callback` never runs again.

```js
let ticks = 0;
const cancel = setCancellableInterval(() => {
  ticks++;
  if (ticks === 3) cancel(); // can cancel from inside the callback
}, 100);
// ticks reaches 3 after ~300ms and then stops
```

## Requirements

- Call `callback(...args)` every `delay` ms until cancelled. `delay` defaults to `0`.
- Return a function that stops all future calls.
- Cancelling from **inside** the callback must work, and so must cancelling before the first tick.
- Calling the cancel function more than once is a harmless no-op.

## Follow-up

- What happens with `setInterval` if the callback takes longer than `delay`?
- How would you write a version that waits for an async callback to finish before scheduling the next run?
