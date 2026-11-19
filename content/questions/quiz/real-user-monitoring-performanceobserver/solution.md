## TL;DR

`PerformanceObserver` subscribes to performance entries the browser records: navigation and resource timing, paints, LCP, layout shifts, event timing, long animation frames, and your own `performance.mark`/`measure` calls. A RUM pipeline **observes with `buffered: true`, aggregates in the page, sends once when the page is hidden** (`visibilitychange` + `sendBeacon` or `fetch` with `keepalive`), then **analyses percentiles segmented by route, device, connection and release**. For the Core Web Vitals, use Google's `web-vitals` library rather than reimplementing their edge cases.

## Useful entry types

| `type` | What you get |
|---|---|
| `navigation` | TTFB, DNS/TCP/TLS, DOMContentLoaded, load, redirect count, `activationStart` for prerendered pages |
| `resource` | Per-request timing. Cross-origin detail needs `Timing-Allow-Origin` on the response |
| `paint` | First Paint, First Contentful Paint |
| `largest-contentful-paint` | LCP candidates, with element and URL |
| `layout-shift` | Shift values and sources (Chromium) |
| `event` | Event Timing, the basis of INP (set `durationThreshold`) |
| `long-animation-frame` | Slow frames with script attribution (Chromium) |
| `mark` / `measure` | Your own business timings |

Check `PerformanceObserver.supportedEntryTypes` before observing.

## A minimal collector

```js
const metrics = {};

new PerformanceObserver(list => {
  const entries = list.getEntries();
  metrics.lcp = entries.at(-1).startTime;  // latest candidate wins
}).observe({ type: 'largest-contentful-paint', buffered: true });

// Custom, business-relevant timing
performance.mark('search-results-rendered');
performance.measure('search-latency', 'search-submitted', 'search-results-rendered');

addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'hidden') return;
  const nav = performance.getEntriesByType('navigation')[0];
  const payload = JSON.stringify({
    ...metrics,
    ttfb: nav?.responseStart,
    route: location.pathname,
    release: window.__RELEASE__,
    ect: navigator.connection?.effectiveType,   // Chromium only
    deviceMemory: navigator.deviceMemory,       // Chromium only
  });
  navigator.sendBeacon('/rum', payload);
});
```

**Why `visibilitychange` and not `unload`?** `unload` is unreliable on mobile (apps get killed without it firing) and makes the page ineligible for the back/forward cache. Chrome is phasing `unload` out. `pagehide` is an acceptable extra signal. Because a page can be hidden and shown again, make the server tolerate several beacons per page view, or send the final value of each metric once.

## Analysis is the hard part

- **Percentiles, not means.** Report p75 (CWV), and p95/p99 for tail problems.
- **Segment** by route template, device class, country and effective connection type, and by release, so a deploy that regressed one route is visible.
- **Sampling.** Beacon 1–10% of sessions on high-traffic sites, but keep 100% of error and very-slow sessions if possible.
- **Soft navigations.** SPAs' route changes don't create new navigation entries. You need router-driven marks. Chromium has been trialling a Soft Navigations API.
- **bfcache and prerender.** Reset metrics on `pageshow` with `persisted`, and subtract `activationStart` for prerendered pages. `web-vitals` handles both.
- **Privacy.** Don't send full URLs with tokens or personal data. Strip query strings, and respect consent requirements.

## Pitfalls

- Missing early entries by observing too late without `buffered: true`.
- Cross-origin resource timings showing zeros because the CDN doesn't send `Timing-Allow-Origin`.
- Comparing lab Lighthouse scores with RUM p75 and treating the difference as noise.
- Collecting everything but never building alerts. Wire p75 regressions per route into on-call or release gates.

## In an interview, mention…

- Buffered observers, beacon on `visibilitychange`, and why `unload` is harmful.
- `web-vitals` (with attribution) for CWV, and custom marks for business moments such as "time to first search result".
- Segmentation by release and route as the thing that makes RUM actionable.
- SPA soft navigations, bfcache, prerender and sampling as advanced concerns.
