## TL;DR

INP is the latency from a user's click, tap or key press to the **next frame painted**, roughly the worst one in the visit. Good is **≤ 200 ms at p75**. Every interaction has three phases: **input delay** (the main thread is busy with something else), **processing time** (your event handlers) and **presentation delay** (style, layout, paint and React commit work for the resulting update). Use field attribution to find the slow interaction and phase, then **do less, yield sooner, and paint feedback first**.

## Find it

1. **RUM with attribution.** `web-vitals/attribution` reports the interaction target, event type, the three phases and, in Chromium, Long Animation Frame (LoAF) script attribution: which script URL and function ran.
2. **Reproduce in the lab.** Use the DevTools Performance panel with 4x–6x CPU throttling, perform the interaction and look for the long task. The live metrics view in DevTools shows INP as you click around.
3. Pay attention to the **phase**. Input delay points to *other* work (hydration, third-party tags, timers). Processing time points to your handler. Presentation delay points to a large DOM or an expensive render.

```js
import { onINP } from 'web-vitals/attribution';
onINP(({ value, attribution: a }) => {
  report({
    value,
    target: a.interactionTarget,
    type: a.interactionType,
    inputDelay: a.inputDelay,
    processing: a.processingDuration,
    presentation: a.presentationDelay,
    scripts: a.longAnimationFrameEntries?.flatMap(f => f.scripts.map(s => s.sourceURL)),
  });
});
```

## Fix it

**Input delay**
- Break up long tasks during load: chunk hydration, defer non-critical third-party scripts, avoid big `setInterval` jobs.
- Don't let analytics run synchronously in the same click handler.

**Processing time**
- Do the visible update first, then yield, then do the rest:

```js
button.addEventListener('click', async () => {
  showSpinner();                 // cheap visual feedback
  await yieldToMain();           // let the browser paint
  const result = expensiveFilter(data);
  render(result);
  queueAnalytics('filter');      // non-urgent work later
});

function yieldToMain() {
  if (globalThis.scheduler?.yield) return scheduler.yield();
  return new Promise(r => setTimeout(r, 0));
}
```

`scheduler.yield()` keeps your continuation at the front of the queue. Support is Chromium plus recent Firefox, so feature-detect it. In React, `startTransition` or `useDeferredValue` marks expensive re-renders as interruptible so typing stays responsive.

- Move pure computation (parsing, diffing, search indexing) to a **Web Worker**.
- Debounce work driven by `input` events, but never debounce the visual echo of the keystroke itself.

**Presentation delay**
- Reduce DOM size. Virtualise long lists and use `content-visibility: auto` for off-screen sections.
- Avoid layout thrashing (reading layout after writing styles in a loop).
- Keep React updates narrow: colocate state, memoise heavy subtrees, and avoid context updates that re-render the whole app.

## Pitfalls

- Thinking `async` makes a handler non-blocking. Code before the first real `await` still runs synchronously, and so do the microtasks after it, all before the next paint.
- Optimising only your code while a tag manager blocks the main thread for 300 ms after every click.
- Testing only on fast laptops. INP problems mostly show up on mid-range Android devices.
- Confusing TBT (lab, load-time only) with INP. A page can have low TBT and still have terrible INP on a later interaction.

## In an interview, mention…

- The three phases and how each maps to a different fix.
- Field attribution (`web-vitals`, the LoAF API) leading to lab reproduction with CPU throttling.
- Yielding (`scheduler.yield` with a fallback), React transitions, Workers, and DOM size.
- That INP replaced FID in March 2024 because FID ignored processing and rendering time.
