## TL;DR

Split resources into two classes. **Fingerprinted static assets** (`app.3f9a1c.js`) get **`Cache-Control: public, max-age=31536000, immutable`**: cache forever, and a new deploy simply references new URLs. **HTML and other mutable URLs** get **`no-cache`** (store, but revalidate every time using an **ETag**, answered with a cheap `304`) or a short `max-age` with **`stale-while-revalidate`**. Use **`s-maxage`** to give CDNs a different lifetime than browsers, `private` or `no-store` for personalised or sensitive responses, and always think about **how you'll purge**.

## The vocabulary

| Directive | Meaning |
|---|---|
| `max-age=N` | Fresh for N seconds; served without contacting the server |
| `s-maxage=N` | Like `max-age` but only for shared caches (CDNs, proxies) |
| `no-cache` | May store, but **must revalidate** before each use. Not "don't cache" |
| `no-store` | Don't store anywhere. For truly sensitive responses |
| `private` / `public` | Only the browser may store it / shared caches may too |
| `immutable` | Don't revalidate even on reload while fresh |
| `stale-while-revalidate=N` | After expiry, serve stale for up to N s while refreshing in the background |
| `stale-if-error=N` | Serve stale if the origin is failing (supported mainly by CDNs) |
| `must-revalidate` | Never serve stale after expiry |

**Validators**: `ETag` (an opaque version, compared with `If-None-Match`) or `Last-Modified` (`If-Modified-Since`). A match returns **`304 Not Modified`** with no body, which saves bytes but still costs a round trip.

## A strategy that works

```http
# /assets/app.3f9a1c.js, /assets/logo.8b21.svg
Cache-Control: public, max-age=31536000, immutable

# /index.html, /products/42 (HTML)
Cache-Control: no-cache
ETag: "v-2025-06-12-a1"
# or, at the CDN, cache briefly and refresh in the background:
Cache-Control: public, max-age=0, s-maxage=60, stale-while-revalidate=300

# /api/catalog (public, tolerates slight staleness)
Cache-Control: public, max-age=30, stale-while-revalidate=120

# /api/me, /account (personalised)
Cache-Control: private, no-cache
# /api/payment-methods (sensitive)
Cache-Control: no-store
```

Why it works: HTML is the **entry point** that references hashed assets. As long as HTML is always revalidated, a deploy is visible immediately, and the long-cached assets are always correct for the HTML that references them.

## CDN considerations

- **`Vary`** splits cache entries by request header (`Accept-Encoding`, `Accept` for image formats). `Vary: Cookie` or `Vary: User-Agent` destroys hit rates. Normalise at the edge instead.
- Many CDNs support **cache tags or surrogate keys** for targeted purges ("purge everything tagged `product-42`"), which is better than very short TTLs.
- Use `CDN-Cache-Control` or vendor-specific headers when you need the CDN and browser to behave differently without leaking directives downstream.
- Watch for **personalised responses cached publicly**. Setting `Set-Cookie` on a cacheable response is a classic data-leak incident: one user's session served to everyone.

## Pitfalls and real incidents

- **No-hash filenames with long `max-age`** (`/app.js` cached for a year). Users run stale code until they hard-refresh, and there's no way to recall it.
- **Deploy skew**: deleting old hashed assets during deploy while cached HTML still references them, which leads to 404s or `ChunkLoadError`. Keep previous builds' assets for a while.
- Heuristic caching: with no `Cache-Control` but a `Last-Modified`, browsers guess a freshness lifetime (often 10% of the age). Always be explicit.
- Service worker caches sit *in front of* the HTTP cache and can mask header changes.
- `no-cache` misunderstood as `no-store` (and vice versa).
- Pages with `Cache-Control: no-store` have historically been ineligible for the back/forward cache in Chromium. Chrome has been relaxing this in some cases, but avoid `no-store` on HTML unless you really need it.

## In an interview, mention…

- Hashed immutable assets + revalidated HTML as the core pattern, and why it makes deploys safe.
- `no-cache` vs `no-store`, ETag/304, `s-maxage` and `stale-while-revalidate`.
- CDN `Vary` hygiene, purging, and the "cached `Set-Cookie`" leak.
- How you'd verify: response headers in DevTools, CDN hit ratio, and `Age` headers.
