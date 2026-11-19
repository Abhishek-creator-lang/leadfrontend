## TL;DR

**`requestAnimationFrame(cb)`** runs `cb` **once, right before the browser's next rendering update**, at the display's refresh rate (60, 120 Hz…), and is paused in hidden tabs. Use it for **visual updates** such as JS-driven animation, canvas drawing and batched DOM writes. **`requestIdleCallback(cb, { timeout })`** runs `cb` when the browser has **spare time** in a frame, passing a `deadline` you must respect. Use it for **non-urgent background work** such as analytics, prefetching and cache warming. **`setTimeout`** queues an ordinary task after a minimum delay. It isn't aligned with frames, and is clamped and throttled.

## Where they sit in a frame

```
task → microtasks → [rendering opportunity:
   resize/scroll events → rAF callbacks → style → layout → paint ]
   → idle period (rIC callbacks if time remains before next frame)
```

| | `requestAnimationFrame` | `requestIdleCallback` | `setTimeout(fn, 0)` |
|---|---|---|---|
| Runs | Before the next paint | In idle periods (≤ 50 ms slices) | As a task after ≥ delay |
| Frequency | Once per frame per request | When idle; may be postponed indefinitely without `timeout` | Once |
| Background tab | Paused | Throttled heavily | Throttled (≥ 1 s, longer under intensive throttling) |
| Good for | Visual updates, measuring then mutating DOM | Low-priority, chunkable work | Yielding, deferring |
| Not good for | Heavy computation (blocks the frame) | DOM changes (they force extra layout in the next frame), anything urgent | Smooth animation |

## Examples

```js
// rAF animation loop with time-based movement (refresh-rate independent)
let last;
function step(now) {
  const dt = last ? now - last : 0;
  last = now;
  x += speed * dt;
  box.style.transform = `translateX(${x}px)`;
  if (x < 500) requestAnimationFrame(step);
}
requestAnimationFrame(step);

// rIC: process a queue in idle slices, with a guarantee it eventually runs
function drain(deadline) {
  while (queue.length && deadline.timeRemaining() > 2) send(queue.shift());
  if (queue.length) requestIdleCallback(drain, { timeout: 2000 });
}
requestIdleCallback(drain, { timeout: 2000 });
```

Key details:
- rAF callbacks receive a **high-resolution timestamp**. Compute movement from elapsed time, not frame count, or animations run twice as fast on 120 Hz screens.
- Several rAF callbacks requested in the same frame all run in that frame. A callback that requests another rAF runs in the **next** frame.
- `deadline.didTimeout` tells you the callback ran because of the timeout, not idleness. Do minimal work then.
- If you make DOM changes from idle work, schedule them with rAF.

## Support and alternatives

- `requestIdleCallback` has historically been missing in Safari, so feature-detect and fall back (`setTimeout` with a small delay). The polyfill can't truly detect idleness.
- **`scheduler.postTask(fn, { priority: 'background' })`** is a more general prioritised alternative where supported. `scheduler.yield()` is for breaking up long tasks.
- For most animations, CSS transitions, CSS animations and the **Web Animations API** beat rAF loops. They can run on the compositor and don't need main-thread time every frame.

## Pitfalls

- Doing heavy work in rAF. You only have a few milliseconds per frame (~16.7 ms at 60 Hz, ~8.3 ms at 120 Hz, including the browser's own work).
- Assuming rAF runs in background tabs. Timers and sync logic tied to it stall.
- Using rIC for something the user is waiting for. On a busy page it may not run for seconds.
- Double-rAF hacks (`rAF(() => rAF(fn))`) to "wait for paint". They work, but `scheduler.yield()` or a well-placed rAF + `setTimeout` is clearer.

## In an interview, mention…

- Position in the frame lifecycle and the background-tab behaviour.
- Time-based animation with the rAF timestamp, and the refresh-rate pitfall.
- rIC deadlines, `timeout`, Safari support, and `scheduler.postTask` as the modern alternative.
- Preferring CSS or WAAPI for animations.
