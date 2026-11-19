## TL;DR

First find out **what the LCP element is** and **where the time goes**. LCP splits into four sub-parts: **TTFB → resource load delay → resource load duration → element render delay**. On most slow sites the biggest waste is *load delay*: the browser discovers the hero image late (lazy-loaded, set by JavaScript or as a CSS background) or gives it low priority. Make the LCP resource **discoverable in the HTML, high priority and small**, cut TTFB with caching or a CDN, and keep render-blocking CSS and JS from holding the paint.

## Step 1: measure in the field, with attribution

```js
import { onLCP } from 'web-vitals/attribution';
onLCP(({ value, attribution }) => {
  const { target, url, timeToFirstByte, resourceLoadDelay,
          resourceLoadDuration, elementRenderDelay } = attribution;
  report({ value, target, url, timeToFirstByte, resourceLoadDelay,
           resourceLoadDuration, elementRenderDelay });
});
```

Group by route and device. You will often find the LCP element differs between mobile (a heading) and desktop (a hero image), and that a single template accounts for most of the poor visits.

## Step 2: fix the dominant sub-part

| Sub-part | A rough healthy share | Typical causes | Fixes |
|---|---|---|---|
| TTFB | ~40% | Uncached SSR, slow API waterfalls on the server, redirects, no CDN | Edge or CDN caching, `stale-while-revalidate`, streaming SSR, remove redirect hops, 103 Early Hints |
| Load delay | < 10% | `loading="lazy"` on the hero, image injected by JS, CSS `background-image`, client-side rendering | Real `<img>` in the server HTML, `fetchpriority="high"`, `<link rel="preload">` if it's only in CSS |
| Load duration | ~40% | Huge JPEGs, no responsive sizes | AVIF/WebP, `srcset` + `sizes`, an image CDN, compression |
| Render delay | < 10% | Render-blocking CSS/JS, web fonts hiding text, hydration gating content, A/B test scripts hiding the page | Inline critical CSS, `defer` scripts, `font-display`, remove anti-flicker snippets |

```html
<!-- Discoverable, prioritised, responsive -->
<img
  src="/hero-800.avif"
  srcset="/hero-480.avif 480w, /hero-800.avif 800w, /hero-1200.avif 1200w"
  sizes="(max-width: 600px) 100vw, 800px"
  width="800" height="450"
  fetchpriority="high"
  alt="Product hero">
```

If the LCP element is **text**, the culprits are usually render-blocking CSS, web fonts (`font-display: swap` or `optional`, preload the font) or a client-rendered shell. Server-rendering the content, or streaming it, usually fixes this.

## Step 3: guard against regressions

- Add a Lighthouse CI or WebPageTest budget on the key templates (lab LCP, and the image bytes).
- Alert on p75 field LCP per route from your RUM data.
- Lint against `loading="lazy"` on above-the-fold images. Framework image components often add it by default unless you mark the image as priority.

## Pitfalls

- **Lazy-loading the hero image** is the most common self-inflicted LCP problem.
- Preloading too many things. Preload competes for bandwidth. Preload **the** LCP resource, not ten.
- CSR SPAs. The LCP element doesn't exist until JS downloads, runs and fetches data. SSR or SSG usually beats any micro-optimisation here.
- Client-side A/B testing tools that hide the body until the variant loads add directly to render delay.
- Measuring on a desktop with a cached result. Test cold loads on a throttled mid-range device.

## In an interview, mention…

- The four-part breakdown and that you fix the biggest slice first, using field attribution data.
- `fetchpriority="high"`, preload, never lazy-loading the hero, and responsive modern image formats.
- TTFB as the floor of LCP: caching, CDN, streaming, Early Hints.
- Ownership: budgets in CI plus RUM alerting so the gain doesn't erode next quarter.
