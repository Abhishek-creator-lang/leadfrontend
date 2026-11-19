## TL;DR

A **long task** is any main-thread task over **50 ms**. While it runs, the browser can't respond to input or paint, which shows up as poor INP and janky scrolling. Fix it by **doing less**, **moving work off the main thread** (Web Workers), or **chunking the work and yielding** between chunks so input and rendering can run in between. The modern yield is **`scheduler.yield()`**, with a `setTimeout` fallback.

## Why 50 ms?

The RAIL model aims to respond to input within 100 ms. If tasks are capped at ~50 ms, an input arriving mid-task waits at most ~50 ms, which leaves budget for the handler and a frame. Total Blocking Time (TBT) in Lighthouse sums the portion of each load-time task beyond 50 ms.

## Ways to yield, compared

| Technique | Where the continuation goes | Notes |
|---|---|---|
| `setTimeout(fn, 0)` | Back of the task queue | Universal. Other tasks (third-party scripts) may run first, and nested timers get clamped to ≥ 4 ms |
| `MessageChannel` post | Task queue, no clamping | What React's scheduler historically used |
| `requestAnimationFrame` | Before the next paint | For visual work, not a general yield |
| `requestIdleCallback` | When the browser is idle | For non-urgent work. Can be postponed indefinitely; support has historically been missing in Safari |
| `scheduler.postTask(fn, { priority })` | A prioritized queue (`user-blocking`, `user-visible`, `background`) | Chromium and recent Firefox; feature-detect |
| `await scheduler.yield()` | Continuation runs **before** other queued tasks of the same priority | Best ergonomics for chunking; Chromium and recent Firefox, not Safari at the time of writing |
| `await promise` | **Microtask, does not yield** | A common misconception |

```js
async function processAll(items) {
  let deadline = performance.now() + 40;
  for (const item of items) {
    process(item);
    if (performance.now() > deadline) {
      await yieldToMain();
      deadline = performance.now() + 40;
    }
  }
}

function yieldToMain() {
  if ('scheduler' in globalThis && 'yield' in scheduler) return scheduler.yield();
  return new Promise(resolve => setTimeout(resolve, 0));
}
```

Yielding by time budget (every ~40–50 ms) rather than after every item avoids paying scheduling overhead thousands of times.

## Other strategies

- **Web Workers** for CPU-heavy pure work: parsing big JSON, search indexing, image processing. The cost is serialisation (structured clone) unless you use transferables.
- **Defer non-critical work** until after the user's update has painted, for example analytics after the click's visual response.
- **React concurrent rendering**: `startTransition` lets React yield between components (roughly every 5 ms) and abandon stale renders.
- **Reduce the work**: fewer DOM nodes, memoisation, avoid layout thrashing, lazy-load code that isn't needed yet.

## Measuring

```js
new PerformanceObserver(list => {
  for (const f of list.getEntries()) {
    if (f.duration > 100) {
      console.log('LoAF', Math.round(f.duration),
        f.scripts.map(s => `${s.sourceURL} ${s.sourceFunctionName}`));
    }
  }
}).observe({ type: 'long-animation-frame', buffered: true });
```

The older `longtask` entries say *that* a task was long but not *what* caused it. **Long Animation Frames (LoAF)**, in Chromium since 2024, attribute time to script URLs and functions and include rendering work, which makes them far more useful in RUM.

## Pitfalls

- Assuming `async`/`await` makes code non-blocking. Microtasks run before rendering.
- Yielding inside code that relies on consistent state. Between chunks, the user may have changed the inputs, so check for staleness or cancel.
- `navigator.scheduling.isInputPending()` was a Chromium-only experiment and is no longer recommended. Prefer yielding on a time budget.

## In an interview, mention…

- The 50 ms definition, and its link to INP and TBT.
- That `scheduler.yield()` keeps your place at the front of the queue, unlike `setTimeout`, and that you'd feature-detect it.
- Workers vs chunking: when the work is parallelisable vs when it needs the DOM.
- LoAF for attribution in production.
