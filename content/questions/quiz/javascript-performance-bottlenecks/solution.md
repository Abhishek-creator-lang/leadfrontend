## TL;DR

The usual suspects are: **too much JavaScript** (download, parse, compile, hydrate), **long tasks** blocking the main thread (hurting INP), **layout thrashing** and expensive rendering, **unnecessary re-renders** in frameworks, **large DOMs**, **network waterfalls** and uncached requests, **memory leaks**, and **third-party scripts**. Measure first (Performance panel, Core Web Vitals field data), then fix the biggest bottleneck.

## 1. Shipping too much JavaScript

Every KB of JS costs network time, then parse/compile and execution on the main thread, which is much slower on mid-range phones than on dev laptops.

- Symptoms: slow LCP/TTI, long tasks at startup, hydration delays.
- Fixes: route-level code splitting, lazy `import()` for heavy widgets, tree-shakeable dependencies, removing polyfills modern targets don't need, server rendering or React Server Components to keep code off the client.

## 2. Long tasks on the main thread

Anything over 50 ms blocks input handling.

```js
// blocks for the whole loop
items.forEach(expensiveTransform);

// yields between chunks so input can be handled
async function processInChunks(items) {
  for (let i = 0; i < items.length; i++) {
    expensiveTransform(items[i]);
    if (i % 200 === 0) await (globalThis.scheduler?.yield?.() ?? new Promise((r) => setTimeout(r)));
  }
}
```

Fixes: chunk and yield, move CPU work to Web Workers, debounce input-driven work, use `startTransition` in React for non-urgent updates.

## 3. Layout thrashing and expensive rendering

```js
// bad: read-write-read-write forces layout each iteration
for (const el of cards) el.style.height = `${el.offsetWidth * 0.5}px`;

// good: batch reads, then writes
const widths = cards.map((el) => el.offsetWidth);
cards.forEach((el, i) => { el.style.height = `${widths[i] * 0.5}px`; });
```

Also: animating layout properties (`top`, `width`) instead of `transform`/`opacity`, huge or deeply nested DOMs, expensive CSS (large blurs, many box-shadows on scroll).

## 4. Unnecessary re-renders (framework level)

- Context providers with new object values on every render, state lifted too high, unstable props breaking `memo`.
- Rendering 10,000 rows instead of virtualizing.
- Fixes: profile with React DevTools Profiler, co-locate state, memoize where measured, virtualize long lists, consider the React Compiler.

## 5. Network bottlenecks

- Request waterfalls (component fetches after its parent renders), no caching headers, uncompressed or unoptimized images, too many third-party origins, chatty APIs (N+1 requests).
- Fixes: parallel or server-side data fetching, preload critical resources, HTTP caching, CDN, image formats (AVIF/WebP) with correct sizing, batching endpoints.

## 6. Memory leaks

```js
function mount() {
  const onResize = () => recalc(hugeData);
  window.addEventListener('resize', onResize);
  // missing removeEventListener: the closure keeps hugeData alive forever
}
```

Other sources: timers never cleared, growing caches without eviction, detached DOM nodes held in arrays, subscriptions not unsubscribed. Symptoms: memory climbs over a session, GC pauses, eventual jank. Find them with heap snapshots (comparison view, "Detached" filter).

## 7. Third-party scripts

Tag managers, analytics, chat widgets and A/B tools often dominate main-thread time. Load them `async`/deferred, after interaction, or in a worker (Partytown), and audit them regularly.

## 8. Inefficient algorithms and data structures

Nested loops over large arrays (`arr.find` inside `arr.map` is O(n²)), `includes` in a loop instead of a `Set`, repeated `JSON.parse(JSON.stringify())` deep clones, regexes with catastrophic backtracking.

## How to approach it

1. Look at field data (CrUX, RUM with `web-vitals`) to find which metric and which pages suffer.
2. Reproduce in DevTools with CPU and network throttling.
3. Fix the largest contributor, measure again, and add a budget or CI check to stop regressions.

## In an interview, mention…

- Main-thread contention as the root of most JS performance problems, tied to INP.
- Concrete fixes for each bottleneck, not just names.
- A measure → fix → guard (budgets, monitoring) loop.
