## Approach

Same shape as the cancellable timeout: start the interval, close over its id, and return a function that clears it.

```js
const intervalId = setInterval(callback, delay, ...args);
return () => clearInterval(intervalId);
```

### Cancelling from inside the callback

This works without any special handling. `const cancel = setCancellableInterval(...)` is assigned synchronously, long before the first tick runs, so by the time the callback runs `cancel` is defined. `clearInterval` during the callback prevents any later ticks.

A common worry is the temporal dead zone: the callback refers to `cancel` before the `const` line "finishes". That's fine. The callback only **reads** `cancel` when it runs, which is after the assignment. It would only fail if the callback were invoked synchronously.

## Complexity

O(1) time and space.

## How `setInterval` behaves under load

- Intervals don't queue up. If a callback runs long, or the main thread is busy, browsers skip missed ticks instead of firing a burst. The effective rate drops.
- Timing drifts. Each tick is scheduled relative to when the timer system processes it, not a fixed clock, so a "1 second" interval clock gradually goes wrong. Recompute from `Date.now()` or `performance.now()` for anything visual (countdowns, clocks).
- Background tabs throttle intervals heavily, often to once per second or less.

## Async callbacks

`setInterval(async () => { await fetchStatus(); }, 1000)` doesn't wait for the fetch. If a request takes 3 seconds, three requests overlap. For polling, chain timeouts instead:

```js
function poll(task, delay) {
  let timerId;
  let stopped = false;
  const run = async () => {
    await task();
    if (!stopped) timerId = setTimeout(run, delay);
  };
  timerId = setTimeout(run, delay);
  return () => {
    stopped = true;
    clearTimeout(timerId);
  };
}
```

The `stopped` flag matters. If the cancel arrives while `task()` is still awaiting, there is no pending timer to clear, and the flag stops the next one from being scheduled.

## Common mistakes

- **Returning the id** instead of a function.
- **Clearing with `clearTimeout`.** It happens to work in browsers because both share an id pool, but it's confusing, and pairing the right clear function is part of the exercise.
- **Forgetting to cancel on unmount** in React, which leaks the interval and calls `setState` on unmounted components:

```js
useEffect(() => setCancellableInterval(() => setNow(Date.now()), 1000), []);
```

## Follow-ups

- Implement `setInterval` itself with chained `setTimeout`s (see `set-interval-with-set-timeout`).
- Add `pause()`/`resume()`, which means tracking the remaining time until the next tick.
