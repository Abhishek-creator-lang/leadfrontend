## Why a central clock

In Parts I and II each bar ran its own `requestAnimationFrame` loop and derived progress from `now - start`. Pausing breaks that model. A bar would need to remember elapsed time, adjust `start` on resume, and every bar would have to coordinate with a global flag. It's easy to get subtly wrong: resuming jumps ahead by the paused duration, or a freshly started queued bar picks up a stale `start`.

The cleaner model is to **store elapsed time per bar** and **advance it from one shared ticker**:

```js
state = { bars: [{ id, elapsed }], nextId, paused }
```

Everything else is derived: percent = `elapsed / DURATION`, running = first 3 unfinished, queued, done, the summary.

## Reducer

All transitions live in one pure function, so they're easy to reason about and unit test without React:

| Action | Effect |
|---|---|
| `add` | Append `{ id, elapsed: 0 }` |
| `toggle` | Flip `paused` |
| `reset` | Clear bars and unpause |
| `tick(dt)` | If not paused, add `dt` to each running bar, capped at `DURATION` |

`tick` recomputes the running set itself. When a bar reaches `DURATION` mid-tick, the next tick automatically includes the next queued bar. There's no `onComplete` callback plumbing as in Part II.

## The loop

```js
useEffect(() => {
  if (!hasWork) return;
  let last; // first frame only records its timestamp
  // rAF: dispatch({ type: 'tick', dt: min(now - last, 100) })
  return () => cancelAnimationFrame(frame);
}, [hasWork]);
```

- `hasWork = !paused && running.size > 0`. The effect depends on that **boolean**, not on `bars`, so it doesn't tear down and restart every frame. It starts when work appears and stops when the queue drains or the user pauses.
- `last` is taken from the **first rAF timestamp** rather than `performance.now()` at effect time. Both clocks should match in browsers, but taking both readings from one source avoids negative or skewed deltas (some environments differ here).
- `last` is reset each time the effect starts, so **paused time is never counted**. That's the "no jump on resume" requirement, and the test checks it.
- `dt` is capped at 100 ms. Browsers throttle or stop rAF in background tabs. Without a cap, coming back could complete every bar in one frame. Whether hidden time *should* count is a product decision. For a simulated download, pausing in the background is reasonable. For a real one, progress comes from the network anyway.
- `dispatch` is stable, so the loop never calls a stale closure.

One loop means one state update per frame for all bars, which scales far better than N independent loops each causing its own render.

## Accessibility

- The toggle uses a **changing label** (Pause/Resume) that names the action. The alternative is a constant "Pause" with `aria-pressed`. Don't do both, or you get "Resume, pressed", which is confusing.
- Queued bars use `aria-valuetext="Queued"` so they don't read as "0%".
- A visible summary, including "Paused", gives the global state. Moving content that runs longer than 5 seconds needs a pause control (WCAG 2.2.2), and this satisfies that.
- Reset is disabled when there's nothing to reset.

## Edge cases

- Pausing with nothing running is fine: the loop isn't running anyway.
- Adding while paused: the bar enters the list but `tick` is a no-op, so it stays queued.
- Reset while paused: unpauses, so the next Add starts immediately (the test covers this).
- Rounding: `aria-valuenow` is rounded. Elapsed time keeps full precision so no progress is lost to rounding.

## Productionizing

- Move the reducer and ticker into a custom hook (`useDownloadQueue`) or an external store with `useSyncExternalStore`. Components then subscribe only to the bars they render.
- For real transfers, "pause" means aborting or throttling requests (`AbortController`, or HTTP Range requests to resume), and progress comes from the network, not a clock.
- Per-bar pause, retry and cancel: add a `status` field and derive `running` from status.

## Testing without fake timers

Use short real waits wrapped in `act`, and assert *relationships* rather than exact numbers: frozen value unchanged after waiting, progress increased after resuming, and the increase smaller than a jump by the paused time would produce. That stays reliable on slow CI machines.
