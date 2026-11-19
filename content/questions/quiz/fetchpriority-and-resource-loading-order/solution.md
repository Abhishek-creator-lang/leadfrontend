## TL;DR

Browsers assign each request a **priority from its type and position**: CSS in `<head>` and blocking scripts are highest, fonts are high, `async`/`defer` scripts are low, images start low (Chromium boosts images found in the viewport once layout runs), and prefetches are lowest. **`fetchpriority="high" | "low" | "auto"`** on `<img>`, `<link>`, `<script>` and `<iframe>` (and the `priority` option of `fetch()`) is a **hint that adjusts priority relative to that default**. Its main use is to **raise the LCP image** so it doesn't wait for layout to be "discovered" as important, and to **lower** things that compete with it (hidden carousel slides, non-critical scripts). It's supported in all major browsers since late 2024.

## Typical default priorities (Chromium, simplified)

| Resource | Default |
|---|---|
| Main HTML | Highest |
| CSS in `<head>`, preloaded fonts | Highest / High |
| Classic `<script>` in `<head>` | High |
| `<script async>`, `defer`, module | Low |
| Images | Low → boosted to High when in the viewport (after layout); the first few large images get a medium boost |
| `fetch()`/XHR | High |
| `<link rel="prefetch">` | Lowest |

Other engines use different schemes, but the shape is similar. The key insight: **the browser only knows an image is in the viewport after layout**, which happens after CSS arrives. Until then, the LCP image may sit in the queue behind lower-value requests.

## Using it

```html
<!-- Hero/LCP image: request at high priority from the start -->
<img src="/hero.avif" fetchpriority="high" width="1200" height="600" alt="…">

<!-- Carousel: first slide high, later slides low -->
<img src="/slide-1.avif" fetchpriority="high" alt="…">
<img src="/slide-2.avif" fetchpriority="low" alt="…">

<!-- Preload with priority (for CSS background heroes) -->
<link rel="preload" as="image" href="/hero-bg.avif" fetchpriority="high">

<!-- Non-critical third-party script -->
<script src="/chat-widget.js" async fetchpriority="low"></script>
```

```js
// Background data that shouldn't compete with user-initiated requests
fetch('/api/recommendations', { priority: 'low' });
```

Field tests on real sites have commonly shown LCP improvements of a few hundred milliseconds from adding `fetchpriority="high"` to the LCP image, though results vary.

## How it interacts with other attributes

- **`loading="lazy"`** delays the request until near the viewport. `fetchpriority` doesn't override that. Never lazy-load the LCP image.
- **`preload`** makes the resource discoverable early. `fetchpriority` sets how urgently it's fetched. They're complementary.
- **`decoding="async"`** is about image decode, not network priority.
- Priority affects **ordering and bandwidth sharing** on HTTP/2 and HTTP/3. It can't make a slow server faster.

## Pitfalls

- Marking many images `high`. If everything is high priority, nothing is. Use it for one or two resources per page.
- Raising priority of a resource that isn't on the critical path, stealing bandwidth from CSS and fonts.
- Framework image components: many have a `priority` prop that sets `fetchpriority="high"` and disables lazy loading. Use the framework's API rather than both.
- Verifying in the wrong place: check the **Priority** column in DevTools' Network panel (enable it via the column header menu) and the LCP sub-parts in RUM.

## In an interview, mention…

- Default priorities and the "images are boosted only after layout" problem.
- `fetchpriority` as a relative hint, used sparingly: high for the LCP image, low for competitors.
- Its relationship with preload and lazy loading.
- Measuring the effect with the Priority column, waterfall, and field LCP.
