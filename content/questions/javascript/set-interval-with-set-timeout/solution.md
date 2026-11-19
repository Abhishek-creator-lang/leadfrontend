## Approach

An interval is a timeout that schedules the next timeout each time it runs. The difficulty is the **id**. Every reschedule produces a new `setTimeout` id, but the caller holds one stable interval id. So keep a registry:

```js
const activeTimers = new Map(); // intervalId -> current setTimeout id
let nextId = 1;
```

- `mySetInterval` allocates an id, schedules the first `tick`, and returns the id.
- `tick` runs the callback, then schedules the next tick **only if the id is still in the registry**.
- `myClearInterval(id)` clears the current timeout and removes the id from the registry.

### Clearing from inside the callback

When the callback runs, the current timeout has already fired, so `clearTimeout` on it does nothing. What stops the interval is the registry check **after** the callback: `myClearInterval` deleted the id, so `tick` doesn't reschedule. If you reschedule *before* calling the callback, you must clear that new timeout instead. Either order works as long as clearing and rescheduling agree on which timeout id is current.

### Exceptions

Native intervals keep running if the callback throws. Reschedule in a `finally` block so an exception doesn't silently kill the interval, while still letting the error surface.

## Complexity

O(1) per tick and per clear. O(k) memory for k active intervals.

## Drift

Each tick is scheduled `delay` ms after the **previous callback finished**. Timer latency and callback time accumulate:

```
target:  100   200   300   400
actual:  102   205   309   412   (the error accumulates)
```

Correct it by scheduling against an absolute timeline:

```js
const start = performance.now();
let n = 0;
function tick() {
  n++;
  callback(...args);
  const nextAt = start + (n + 1) * delay;
  timerId = setTimeout(tick, Math.max(0, nextAt - performance.now()));
}
```

If the page was suspended and you're several ticks behind, decide whether to **skip** missed ticks (usually right for UI clocks) or **catch up** (for simulations).

## Chained `setTimeout` vs `setInterval`

- **Guaranteed gap:** chaining waits `delay` ms *after* each callback finishes. With `setInterval`, a slow callback runs nearly back-to-back with the next one.
- **Async work:** with `await task()` before rescheduling, runs never overlap. This is the standard polling pattern.
- **Dynamic delays:** each step can pick a new delay, for exponential backoff or adaptive polling.
- `setInterval` is simpler when you want a fixed cadence and the callback is short.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Returning the first `setTimeout` id | Clearing works only before the first tick |
| No registry check after the callback | Clearing from inside the callback doesn't stop it |
| Global single `timerId` variable | Two intervals overwrite each other |
| `setTimeout(tick(), delay)` | Infinite synchronous recursion and a stack overflow |
| Never deleting cleared ids | Unbounded map growth |

## Follow-ups

- **Pause/resume:** store the next target time, and on resume schedule the remaining time.
- **Node:** Node's timers return objects with `ref()`/`unref()`. An interval that shouldn't keep the process alive needs `unref()` on each new timeout.
