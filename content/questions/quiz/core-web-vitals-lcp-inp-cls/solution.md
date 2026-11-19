## TL;DR

The three Core Web Vitals are **LCP** (loading: when the largest content element renders), **INP** (responsiveness: how long interactions take to produce the next frame) and **CLS** (visual stability: how much content unexpectedly shifts). A page "passes" when the **75th percentile of real-user visits** is **LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1**, evaluated separately for mobile and desktop. **INP replaced FID as a Core Web Vital on 12 March 2024.**

## The three metrics

| Metric | Measures | Good | Needs improvement | Poor |
|---|---|---|---|---|
| LCP – Largest Contentful Paint | Render time of the largest image, video poster or text block in the viewport | ≤ 2.5 s | ≤ 4 s | > 4 s |
| INP – Interaction to Next Paint | Latency from a click, tap or key press to the next paint, roughly the worst interaction of the visit | ≤ 200 ms | ≤ 500 ms | > 500 ms |
| CLS – Cumulative Layout Shift | Largest "session window" of unexpected layout shifts | ≤ 0.1 | ≤ 0.25 | > 0.25 |

### Why FID was retired

FID only measured the **input delay** of the **first** interaction: the time until the handler could start. It ignored the time spent in the handler and the time to paint, and it ignored every later interaction. Almost every site passed FID, while users still saw sluggish menus and filters. INP looks at **all** clicks, taps and key presses during the visit and reports a value near the worst one (for pages with many interactions, one outlier per 50 interactions is ignored). Each interaction's latency is input delay + processing time + presentation delay.

### CLS session windows

Early CLS summed every shift over the whole page lifetime, which unfairly punished long-lived SPAs. Since 2021, shifts are grouped into **session windows**: a window ends after a 1 s gap with no shifts or after 5 s in total, and CLS is the **largest** window's score. Shifts within 500 ms of user input are excluded, because users expect content to move when they click "expand".

## Field vs lab

- **Field (RUM)** data comes from real users: the Chrome UX Report (CrUX), Search Console, PageSpeed Insights' top section, or your own RUM via the `web-vitals` library. This is what Google uses and what users experience.
- **Lab** data (Lighthouse, WebPageTest, DevTools) is a single synthetic run. It is reproducible and good for debugging regressions, but **Lighthouse cannot measure INP** because there is no user. It reports **Total Blocking Time** as a proxy.

```js
import { onLCP, onINP, onCLS } from 'web-vitals/attribution';

function send(metric) {
  navigator.sendBeacon('/rum', JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    attribution: metric.attribution, // e.g. LCP element, slow INP target
  }));
}
onLCP(send); onINP(send); onCLS(send);
```

## Pitfalls

- Optimising Lighthouse scores while field INP is poor. A fast developer laptop hides main-thread problems that mid-range Android phones expose.
- Looking at averages. The thresholds are at p75, and long tails are often where the money is.
- Forgetting that CrUX only covers Chromium browsers, and only sites with enough traffic. Firefox has exposed LCP and Event Timing for a while and Safari has been adding them more recently, but support and exact definitions still vary, so check the current support tables before comparing numbers across browsers.
- Treating TTFB and FCP as vitals. They are useful **diagnostic** metrics (a slow TTFB caps your LCP) but are not Core Web Vitals.

## In an interview, mention…

- The exact thresholds, p75, and per-device-class evaluation.
- That INP replaced FID in March 2024, and why (FID ignored processing and presentation time).
- Lab vs field, TBT as INP's lab proxy, and using `web-vitals/attribution` to find *which* element or interaction is slow.
- How you'd wire vitals into dashboards and alert on regressions per route, not just site-wide.
