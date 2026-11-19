## TL;DR

Make requests **fewer** (bundle sensibly, batch APIs, dedupe), **smaller** (compression, modern image formats, tree shaking, pagination), **earlier** (preload, preconnect, early hints, avoid waterfalls), **closer** (CDN/edge), **cached** (HTTP cache, service worker, client data cache), and **prioritised** (`fetchpriority`, lazy-loading non-critical resources). Measure with the Network panel's waterfall and field metrics like LCP.

## Fewer requests

- **Kill waterfalls**: a component that fetches after its parent's data arrives creates serial round trips. Fetch in parallel (`Promise.all`), fetch on the server, or hoist data loading to the route level.
- **Batch and shape APIs**: a backend-for-frontend or GraphQL query returning what the screen needs avoids N+1 calls.
- **Deduplicate** concurrent identical requests (TanStack Query/SWR do this) and cancel obsolete ones with `AbortController`.
- **Inline tiny critical resources** (critical CSS, small SVG icons) when it saves a round trip.

## Smaller payloads

- Text compression: **Brotli** (or zstd where supported) for JS/CSS/HTML/JSON; gzip as fallback.
- Images: AVIF/WebP, responsive `srcset`/`sizes`, correct dimensions, image CDNs.
- JavaScript: code splitting, tree shaking, dropping legacy polyfills, auditing dependencies.
- Fonts: WOFF2, subsetting, fewer weights (or a variable font).
- API responses: pagination, field selection, avoiding over-fetching.

## Earlier

```html
<link rel="preconnect" href="https://cdn.example.com" crossorigin>
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="modulepreload" href="/assets/route-home.js">
<img src="/hero.avif" fetchpriority="high" alt="…">
```

- **Preconnect** to critical third-party origins (DNS + TCP + TLS ahead of time).
- **Preload** late-discovered critical resources (fonts, LCP images referenced in CSS).
- **103 Early Hints** let the server send preload hints while the HTML is still being generated.
- **Prefetch** likely next navigations (`<link rel="prefetch">`, Speculation Rules for prerendering).
- Avoid **render-blocking** scripts: `defer`/`async`/`type="module"`.

## Closer and faster transport

- Serve static assets and cacheable HTML from a **CDN/edge**.
- **HTTP/2 and HTTP/3** multiplex requests over one connection; HTTP/3 (QUIC) handles lossy mobile networks better. Domain sharding is an HTTP/1.1-era technique that now hurts.
- Minimise **redirects** and **third-party origins** (each new origin costs a connection setup).

## Cached

```http
Cache-Control: public, max-age=31536000, immutable   # hashed assets
Cache-Control: no-cache                              # HTML, revalidated via ETag
```

Plus service-worker caching for offline/repeat visits and a client-side server-state cache to avoid refetching on every mount.

## Prioritised

- `fetchpriority="high"` for the LCP image, `low` for below-the-fold carousels.
- `loading="lazy"` for off-screen images and iframes.
- `fetch(url, { priority: 'low' })` for background requests.
- Defer analytics and widgets until after load or interaction; use `navigator.sendBeacon` or `keepalive` for exit beacons.

## Resilience matters too

- Timeouts (`AbortSignal.timeout`), retries with exponential backoff + jitter for idempotent requests, and optimistic UI to hide latency.
- Respect the user's data budget: `navigator.connection.saveData` (Chromium) to skip heavy media.

## Diagnosing

- **Network panel**: waterfall (look for staircases), priority column, size vs transferred (compression/caching), timing breakdown (DNS, TLS, TTFB).
- **WebPageTest** connection view on real mobile profiles.
- Field data: LCP subparts (TTFB, resource load delay, load duration) show which part is slow.

## In an interview, mention…

- The fewer/smaller/earlier/closer/cached/prioritised framework.
- Waterfalls as the most common real-world problem and how to remove them.
- Resource hints and `fetchpriority` with concrete examples.
- Caching headers strategy and measuring with the waterfall and LCP breakdown.
