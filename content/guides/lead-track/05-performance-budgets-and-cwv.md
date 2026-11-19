---
title: Performance budgets and Core Web Vitals
description: Running front end performance as an organizational program, with Core Web Vitals, budgets, RUM, CI guardrails, ownership, and linking performance to business outcomes.
source: original
---
A senior engineer fixes slow pages. A lead makes sure pages **stay** fast as 50 engineers ship every day. That takes budgets, measurement, ownership, and a way to tie performance to business outcomes so it gets prioritized. This chapter covers how to run performance as a program.

## Core Web Vitals refresher

| Metric | Measures | Good | Needs improvement | Poor |
| --- | --- | --- | --- | --- |
| LCP | Time until the largest content element renders | ≤ 2.5 s | 2.5–4 s | > 4 s |
| INP | Latency from user interaction to next paint (roughly the worst interaction per visit) | ≤ 200 ms | 200–500 ms | > 500 ms |
| CLS | Unexpected layout movement | ≤ 0.1 | 0.1–0.25 | > 0.25 |

- Assessed at the **75th percentile** of page loads, separately for mobile and desktop.
- INP replaced FID in March 2024. INP is much harder to pass because it covers *all* interactions, not just the first input delay.
- Google Search uses CWV as one (modest) ranking signal through the page experience system, using field data from the Chrome UX Report (CrUX).

Supporting diagnostics: TTFB, FCP, Total Blocking Time (lab), Long Animation Frames (LoAF), JS bytes, and request counts.

## Lab vs field data

| | Lab (synthetic) | Field (RUM) |
| --- | --- | --- |
| Source | Lighthouse, WebPageTest, CI runs | Real users via `web-vitals` library, CrUX, RUM vendors |
| Strength | Reproducible, debuggable, catches regressions pre-merge | Truth across real devices, networks, geographies |
| Weakness | Doesn't reflect real user diversity; INP can't be measured without real interactions (TBT is a proxy) | Noisy, delayed, harder to debug |
| Use for | Guardrails and diagnosis | Goals and prioritization |

**Set goals on field data. Enforce guardrails with lab data.**

## Budgets

A budget is a threshold the team agrees not to exceed. Three kinds:

| Type | Examples | Enforced where |
| --- | --- | --- |
| Quantity | JS ≤ 170 KB compressed on the critical path; ≤ 2 web fonts; images ≤ 200 KB above the fold | CI (size-limit, bundler stats) |
| Timing (lab) | Lighthouse performance ≥ 90 on key routes; TBT ≤ 200 ms on emulated mid-tier mobile | CI (Lighthouse CI) |
| Field outcomes | p75 LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 per route and device class | RUM dashboards and alerts |

### Setting realistic budgets

1. Measure the current baseline per route.
2. Benchmark competitors (CrUX data is public per origin).
3. Set the budget slightly better than today. Ratchet it down quarterly.
4. Budget by **route type** (landing, product, checkout, app shell), not one global number.

### Enforcing in CI

```json
// .size-limit.json
[
  { "path": "dist/assets/index-*.js", "limit": "170 KB", "gzip": true },
  { "path": "dist/assets/checkout-*.js", "limit": "60 KB", "gzip": true }
]
```

```yaml
# lighthouserc (excerpt)
ci:
  assert:
    assertions:
      categories:performance: ["error", { minScore: 0.9 }]
      largest-contentful-paint: ["warn", { maxNumericValue: 2500 }]
      total-blocking-time: ["error", { maxNumericValue: 200 }]
      cumulative-layout-shift: ["error", { maxNumericValue: 0.1 }]
```

**Policy:** a budget breach blocks the merge unless an owner approves an exception with a linked follow-up ticket. Exceptions are reviewed monthly.

## Real user monitoring

```ts
import { onLCP, onINP, onCLS } from 'web-vitals/attribution';

function send(metric: { name: string; value: number; rating: string; attribution?: unknown }) {
  navigator.sendBeacon('/rum', JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    route: currentRouteTemplate(),   // '/products/:id', not the raw URL
    release: __RELEASE__,
    deviceClass: navigator.hardwareConcurrency <= 4 ? 'low' : 'high',
    attribution: metric.attribution,
  }));
}

onLCP(send);
onINP(send);
onCLS(send);
```

- **Attribution builds** tell you *which element* was the LCP and *which interaction and script* caused poor INP.
- Segment by route template, device class, connection, country, and release.
- Track p75 trends per release so you can pinpoint regressions.

## Ownership model

```mermaid
flowchart LR
  Platform[Platform or perf team] --> Tooling[Tooling, dashboards, budgets]
  Tooling --> Teams[Product teams own their routes]
  Teams --> Reviews[Monthly perf review]
  Reviews --> Platform
```

| Role | Responsibility |
| --- | --- |
| Performance champion or platform team | Tooling, RUM pipeline, CI checks, education, deep investigations |
| Product teams | Own the vitals for their routes; fix regressions they cause |
| Engineering leadership | Sets targets, protects capacity (e.g. 10% of sprint for performance and quality) |
| Product management | Agrees to targets as product requirements |

Without per-route ownership, performance becomes everybody's problem and nobody's job.

## Linking to business outcomes

Performance work competes with features. Win the prioritization argument with data:

- **Correlate** vitals with conversion, bounce, or engagement by segment (users with good LCP vs poor LCP).
- **Run experiments:** A/B test a performance improvement where possible (e.g. image optimization on half the traffic).
- **Use public case studies carefully.** They help, but your own data persuades far more.
- **Translate into money:** "Checkout INP improvement correlated with +1.8% conversion on mobile ≈ $X per quarter."

## The regression playbook

1. **Detect:** a RUM alert fires (p75 INP on `/search` above 250 ms for 2 consecutive days).
2. **Locate:** compare releases; use attribution data to find the interaction and script.
3. **Assign:** the route owner picks it up; the perf champion supports.
4. **Fix or revert:** if the regression is severe, roll back via feature flag.
5. **Prevent:** add a lab check or lint rule that would have caught it.

## High-impact levers at org scale

| Lever | Impact |
| --- | --- |
| Third-party script governance (tag manager review, loading strategy, budgets) | Often the largest INP and LCP win |
| Image CDN with automatic format and size | LCP, bandwidth |
| SSR/streaming or RSC for content-heavy routes | LCP, JS bytes |
| Fast-by-default design-system components | Prevents regressions everywhere |
| Route-level code splitting conventions | JS bytes, INP |
| Font strategy (self-host, subset, `font-display`, fallback metrics) | LCP, CLS |
| Back/forward cache eligibility (avoid `unload` handlers, `Cache-Control: no-store`) | Instant back navigations |
| Speculation Rules API for prefetch/prerender of likely next pages (Chromium) | Near-instant navigations |

## Reporting

A monthly one-page performance report for leadership:

| Route | p75 LCP (mobile) | Δ vs last month | p75 INP | Δ | CLS | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Home | 2.1 s | −0.2 | 160 ms | −20 | 0.03 | Growth | On track |
| Search | 2.9 s | +0.4 | 310 ms | +90 | 0.05 | Discovery | Regressed |
| Checkout | 2.3 s | 0 | 180 ms | −10 | 0.02 | Payments | On track |

Add one paragraph per red row: cause, owner, ETA.

## Interview framing

> "I treat performance as a product requirement with owners. We set p75 field targets per route type, enforced lab budgets in CI for JS size and TBT, and built a RUM pipeline with attribution so regressions pointed to specific scripts. The biggest single win was governing third-party tags: we moved four marketing scripts behind consent and idle loading, and mobile INP on product pages went from 340 to 190 ms. We showed a correlated 2% conversion lift, which got us a standing 10% capacity allocation for performance."
