## TL;DR

Split tools into **lab** (controlled, reproducible: DevTools Performance panel, Lighthouse, WebPageTest) and **field** (real users: CrUX, RUM via the `web-vitals` library or a vendor). Add **bundle analysers** for what you ship, **memory tools** for leaks, **framework profilers** for render costs, and **performance APIs** (`performance.mark/measure`, `PerformanceObserver`) for custom instrumentation. Field data tells you *what* is slow for users; lab tools tell you *why*.

## Lab tools

**Chrome DevTools Performance panel**: the main investigation tool.

- Record with CPU (4–6×) and network throttling to approximate mid-range phones.
- The flame chart shows long tasks (red corner), scripting (yellow), style/layout (purple), paint (green).
- Shows forced reflow warnings, INP-style interactions, LCP and layout-shift markers, and third-party attribution.
- The live metrics view shows local LCP/CLS/INP while you interact, optionally next to field data.

**Lighthouse** (DevTools, CLI, PageSpeed Insights, Lighthouse CI): scored audits for load performance, accessibility and best practices, with specific opportunities (unused JS, render-blocking resources, image sizing). Great for regression checks in CI, but it's a single synthetic load, so don't treat the score as the goal.

**WebPageTest**: real devices and locations, filmstrips, waterfall charts, connection views, repeat-view caching analysis, and scripted journeys.

**Other DevTools panels**: Network (waterfall, priorities, caching), Coverage (unused JS/CSS bytes), Rendering (paint flashing, layout shift regions), Performance monitor (live CPU, DOM nodes, listeners, JS heap).

## Field (real-user) data

```js
import { onLCP, onINP, onCLS } from 'web-vitals';

function send(metric) {
  navigator.sendBeacon('/rum', JSON.stringify({
    name: metric.name, value: metric.value, rating: metric.rating, id: metric.id,
  }));
}
onLCP(send); onINP(send); onCLS(send);
```

- **CrUX** (Chrome UX Report): public 28-day field data for origins and URLs, exposed in PageSpeed Insights and Search Console.
- **RUM vendors** (Sentry, Datadog, SpeedCurve, New Relic, Vercel Analytics…) segment by page, device and country, and attribute slow interactions to scripts (the Long Animation Frames API helps here).

## Custom instrumentation

```js
performance.mark('filter-start');
applyFilters();
performance.mark('filter-end');
performance.measure('filter', 'filter-start', 'filter-end'); // shows in DevTools timeline

new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) console.log(entry.name, entry.duration);
}).observe({ type: 'long-animation-frame', buffered: true });
```

Resource Timing, Navigation Timing, Event Timing and Element Timing entries are all available through `PerformanceObserver`.

## Bundle and build analysis

- `rollup-plugin-visualizer`, `webpack-bundle-analyzer`, `source-map-explorer`: what's inside each chunk.
- Size-limit/bundlesize-style checks to fail CI when a budget is exceeded.
- Bundlephobia-type lookups before adding a dependency.

## Memory

DevTools **Memory** panel: heap snapshots (compare before/after an action, filter "Detached" DOM nodes), allocation timelines, and allocation sampling. `performance.measureUserAgentSpecificMemory()` exists for field memory measurement in cross-origin-isolated pages.

## Framework and runtime profilers

- **React DevTools Profiler**: which components rendered, why, and how long; "Highlight updates" to spot unnecessary renders.
- Vue/Angular DevTools equivalents.
- **Node.js**: `--cpu-prof`, `--inspect` with Chrome DevTools, clinic.js for server-side rendering hot spots.

## A workflow that works

1. Field data identifies the problem metric and pages.
2. Reproduce in the Performance panel with throttling; find the long task or waterfall.
3. Fix, verify in the lab, then confirm in field data after release.
4. Guard with Lighthouse CI and bundle budgets.

## In an interview, mention…

- Lab vs field and why you need both.
- Specific panels and APIs you've actually used to solve a problem.
- Turning findings into guardrails (budgets, CI, dashboards).
