## TL;DR

CLS measures **unexpected** movement of visible content. Each shift scores *impact fraction × distance fraction*. Shifts are grouped into **session windows** (a window ends after a 1 s gap or at 5 s in total), and CLS is the **worst window**. Good is **≤ 0.1 at p75**. The usual causes are **media without dimensions, late-injected content (ads, banners, embeds), web-font swaps and animating layout properties**. The fix is to **reserve space up front** and animate with `transform`.

## How it's scored

- A shift happens when an element that was already visible changes its start position between two frames.
- *Impact fraction* is the share of the viewport touched by the unstable elements across both frames. *Distance fraction* is how far they moved relative to the viewport.
- Shifts within **500 ms of a discrete user input** (click, tap, key press) are flagged `hadRecentInput` and excluded. Scrolling and hover don't count as input for this purpose.
- Because of session windows, a long-lived SPA isn't punished for small shifts spread over an hour, but one bad burst still counts.

## Common causes and fixes

| Cause | Fix |
|---|---|
| `<img>`/`<video>`/`<iframe>` without size | Set `width` and `height` attributes (browsers derive `aspect-ratio` from them), or CSS `aspect-ratio` |
| Ads and embeds that size themselves late | Reserve a `min-height` slot for the most likely size, and don't collapse the slot when no ad fills it |
| Cookie banners or "app install" bars pushing content down | Overlay them (`position: fixed`) instead of inserting them into the flow at the top |
| Content loaded after render (recommendations, reviews) | Skeletons with the same dimensions, or insert below the viewport |
| Web font swap changes text metrics | `size-adjust`, `ascent-override` etc. on a fallback `@font-face` to match metrics; preload the font; `font-display: optional` |
| Animating `top`/`height`/`margin` | Animate `transform` and `opacity` instead |
| Client-side hydration that swaps the SSR markup | Render the same markup on server and client; avoid `if (typeof window)` branches in render |

```css
/* Metric-matched fallback reduces the font-swap shift */
@font-face {
  font-family: "Brand Fallback";
  src: local("Arial");
  size-adjust: 104%;
  ascent-override: 92%;
}
body { font-family: "Brand", "Brand Fallback", sans-serif; }
```

## Debugging

```js
new PerformanceObserver(list => {
  for (const e of list.getEntries()) {
    if (e.hadRecentInput) continue;
    for (const s of e.sources ?? []) {
      console.log(e.value.toFixed(4), s.node, s.previousRect, s.currentRect);
    }
  }
}).observe({ type: 'layout-shift', buffered: true });
```

The `layout-shift` entry type is Chromium-only, so field CLS data mostly comes from Chrome users. DevTools' Performance panel highlights "Layout shift" clusters, and `web-vitals/attribution` reports the largest shift target. That's often enough to name the guilty component in your RUM dashboard.

## Pitfalls

- Lab tools only see load-time shifts. Many real shifts happen after scrolling (lazy-loaded ads, infinite lists) or on back/forward navigation, so you need field data.
- `loading="lazy"` images **with** dimensions are fine. Without dimensions they shift when they load as you scroll.
- Skeletons that are a different height from the real content just move the shift.
- bfcache restores reset the metric. The `web-vitals` library handles this; hand-rolled observers often don't.

## In an interview, mention…

- Session windows (1 s gap, 5 s cap, max window) and the 500 ms input exclusion.
- "Reserve space" as the core principle: dimensions, aspect-ratio, min-height slots, overlays.
- Font metric overrides as the modern fix for FOUT shifts.
- Field attribution to find the element, because lab runs miss post-load shifts.
