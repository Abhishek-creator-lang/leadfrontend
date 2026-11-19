---
title: Performance deep dives
description: The performance topics interviewers probe in front end system design, covering loading, rendering, lists, media, network, and how to frame each as a trade-off tied to Core Web Vitals.
source: original
---
Almost every front end system design interview ends in an optimization deep dive, and performance is the most common one. Candidates often list techniques ("lazy load, memoize, use a CDN"). Strong candidates **diagnose first, then prescribe**, tying each technique to a user-visible metric and saying what it costs.

## Frame performance with metrics

Use Core Web Vitals as the shared vocabulary:

| Metric | Measures | "Good" threshold (p75) | Typical culprits |
| --- | --- | --- | --- |
| LCP (Largest Contentful Paint) | Loading speed of main content | ≤ 2.5 s | Slow TTFB, render-blocking JS/CSS, unoptimized hero image, client-only rendering |
| INP (Interaction to Next Paint) | Responsiveness to input | ≤ 200 ms | Long tasks, heavy re-renders, synchronous work in handlers, hydration |
| CLS (Cumulative Layout Shift) | Visual stability | ≤ 0.1 | Images without dimensions, late-loading ads/banners, font swaps |

Supporting metrics: TTFB, FCP, Total Blocking Time (lab), JS bundle size, memory, and frame rate during scroll.

INP replaced FID as a Core Web Vital in March 2024. Mentioning INP rather than FID signals that your knowledge is current.

## The deep-dive structure

For each topic, use **symptom → cause → options → choice → cost → how to measure**.

> "On mid-range Android the feed scroll stutters (symptom). Each post renders rich media and we keep 500+ nodes mounted (cause). Options: virtualization, `content-visibility: auto`, or paginated DOM capping (options). I'd virtualize with measured heights (choice). This complicates scroll restoration, find-in-page, and a11y (cost). We'd track INP and long-animation-frame data via RUM (measure)."

## 1. Loading performance

### JavaScript

- **Route-level code splitting** with dynamic `import()` and `React.lazy`.
- **Component-level splitting** for heavy, rarely used widgets (editors, charts, emoji pickers).
- **Tree-shaking-friendly imports**. Avoid barrel files that pull in whole libraries.
- **Budget:** e.g. ≤ 170 KB compressed JS for the critical path on mobile.
- **Ship less hydration:** Server Components, islands, or partial hydration move work off the client.

```tsx
const EmojiPicker = React.lazy(() => import('./EmojiPicker'));

function Composer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} aria-expanded={open}>Emoji</button>
      {open && (
        <Suspense fallback={<Spinner label="Loading emoji" />}>
          <EmojiPicker />
        </Suspense>
      )}
    </>
  );
}
```

### Critical rendering path

- Inline critical CSS or keep CSS small. Defer non-critical styles.
- `preconnect` to API and CDN origins. `preload` the LCP image and key fonts.
- `fetchpriority="high"` on the LCP image; `loading="lazy"` on below-the-fold images (never on the LCP image).
- Fonts: `font-display: swap` or `optional`, subset fonts, and use size-adjust fallbacks to limit CLS.

### Server and edge

- Stream SSR so the shell paints before slow data arrives.
- Cache HTML at the edge where personalization allows; split personalized fragments out.
- Use HTTP/2 or HTTP/3, Brotli compression, and immutable caching for hashed assets.
- Early hints (103) where supported.

## 2. Rendering and interaction performance

- **Break up long tasks:** yield to the main thread (`scheduler.yield()` where available, or `setTimeout` chunking) during heavy work.
- **Mark non-urgent updates:** `useTransition` / `startTransition`, `useDeferredValue` for expensive filtered lists.
- **Avoid unnecessary re-renders:** colocate state, split contexts, use memoization (or rely on React Compiler where adopted).
- **Move work off the main thread:** Web Workers for parsing, search indexing, diffing.
- **CSS containment:** `contain: content` and `content-visibility: auto` let the browser skip work for offscreen content.
- **Animate only `transform` and `opacity`** for compositor-friendly animations.

## 3. Large lists and tables

| Technique | When | Trade-off |
| --- | --- | --- |
| Pagination | Users need random access or counts | Less fluid browsing |
| Infinite scroll plus DOM cap | Feeds | Memory still grows unless you unmount old items |
| Virtualization (windowing) | Thousands of rows, uniform or measurable heights | Complexity: variable heights, scroll restoration, find-in-page, screen readers |
| `content-visibility: auto` | Hundreds of complex items | Browser support and scrollbar jumpiness; set `contain-intrinsic-size` |

For accessibility with virtualization: keep proper list semantics, use `aria-setsize` and `aria-posinset` for virtual items, and make sure keyboard focus doesn't get lost when an item unmounts.

## 4. Images and media

- Serve modern formats (AVIF/WebP) via `<picture>` or an image CDN.
- Use responsive `srcset` and `sizes` so phones don't download desktop images.
- Always include `width`/`height` or `aspect-ratio` to prevent CLS.
- Use blur-up or dominant-color placeholders for perceived speed.
- Video: `preload="metadata"`, poster images, adaptive streaming (HLS/DASH), autoplay only when muted and visible.

```html
<img
  src="/img/hero-800.avif"
  srcset="/img/hero-400.avif 400w, /img/hero-800.avif 800w, /img/hero-1600.avif 1600w"
  sizes="(max-width: 600px) 100vw, 800px"
  width="800" height="450"
  fetchpriority="high"
  alt="Product hero"
/>
```

## 5. Network and data

- **Cache server state** with stale-while-revalidate semantics.
- **Deduplicate requests:** one in-flight request per cache key.
- **Prefetch on intent:** hover, focus, or viewport entry for likely next routes.
- **Cancel stale requests** with `AbortController` (autocomplete!).
- **Batch** small requests, and keep payloads lean (field selection, compression).
- **Optimistic updates** make interactions feel instant regardless of latency.
- **Service worker** for offline support, asset caching, and background sync.

## 6. Perceived performance

What users perceive often matters more than what you measure:

- Skeletons that match the final layout (and therefore don't shift).
- Show content progressively: text first, then images.
- Instant feedback on every interaction (pressed state within 100 ms).
- Prioritize above-the-fold work; defer analytics and third-party scripts.

## Measuring and guarding

| Stage | Tool | Purpose |
| --- | --- | --- |
| Local / lab | Lighthouse, DevTools Performance panel, React Profiler | Diagnose |
| CI | Lighthouse CI, bundle-size checks (size-limit) | Prevent regressions |
| Production | RUM via `web-vitals` library, Long Animation Frames API | Real-user truth by device and region |
| Business | Conversion, bounce, engagement correlated with vitals | Justify investment |

Lab data finds causes. Field data (p75, segmented by device and network) tells you whether users actually benefit.

## Matching deep dives to products

| Product | Most important performance topic |
| --- | --- |
| News feed | Virtualization, image optimization, SSR first page, prefetch next page |
| E-commerce PDP | LCP hero image, SSR/ISR, third-party script control |
| Chat | Initial conversation load, message list virtualization, real-time efficiency |
| Autocomplete | Debounce, cancellation, caching by prefix, input responsiveness (INP) |
| Dashboard | Data volume, Web Workers, chart rendering cost, incremental loading |
| Video streaming | Adaptive bitrate, preloading strategy, startup time |
| Collaborative editor | Operation batching, rendering only changed regions, worker-based merge |

## What lead candidates add

- **Budgets and ownership:** "Each route has a JS and LCP budget enforced in CI; the owning team gets paged when p75 regresses."
- **Prioritization by impact:** focus on the slowest real-user segment (e.g. low-end Android in India), not the fastest MacBook.
- **Business linkage:** frame improvements in conversion or retention terms.
- **Org-wide levers:** third-party script governance, shared image CDN, design system components that are fast by default.

## Checklist

- [ ] Framed the problem with a specific metric (LCP, INP, CLS)
- [ ] Diagnosed the cause before prescribing
- [ ] Gave at least two options with trade-offs
- [ ] Covered measurement in the lab and in the field
- [ ] Tied the deep dive to this product's most important user journey
