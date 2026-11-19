## TL;DR

The question is **where and when HTML is produced**. **CSR**: in the browser, after JS loads. **SSR**: on the server, per request. **SSG**: at build time. **ISR**: at build time, then regenerated in the background after a revalidation window or on demand. **Streaming SSR**: on the server per request, but flushed in chunks so the shell paints before slow data resolves. Choose **per route**, based on **how personalised the content is, how fresh it must be, SEO needs, and how interactive it is**. Most real apps mix static marketing pages, ISR catalogues, streamed personalised pages and CSR-heavy dashboards.

## Comparison

| | CSR | SSR | SSG | ISR | Streaming SSR |
|---|---|---|---|---|---|
| HTML built | Browser | Per request | At build | At build + revalidated | Per request, flushed progressively |
| TTFB | Fast (static shell) | Slower (server work) | Fastest (CDN) | Fastest | Fast (shell flushed early) |
| LCP | Slow: JS → data → render | Good | Best | Best | Good, with the shell and important content first |
| Freshness | Live | Live | Stale until rebuild | Bounded staleness | Live |
| Personalisation | Easy | Easy | No (or client-side) | No (or edge/client) | Easy |
| Infra cost | Low (static hosting) | Servers scale with traffic | Low | Low + regeneration | Servers |
| SEO | Weaker, depends on crawler JS rendering | Strong | Strong | Strong | Strong |
| Main risk | Big bundles, blank screen, poor LCP | TTFB under load, cache complexity | Build times with many pages | Stale or inconsistent pages, cache semantics | Error handling after headers are sent |

All server-rendered modes still ship JS for **hydration** if the page is interactive, so SSR alone doesn't fix INP or bundle size. That's what React Server Components, partial hydration and islands address.

## Streaming in practice

```jsx
// React 18+ (sketch): shell renders immediately, reviews stream in later
<Layout>
  <ProductDetails product={product} />
  <Suspense fallback={<ReviewsSkeleton />}>
    <Reviews productId={id} />  {/* slow data */}
  </Suspense>
</Layout>
```

The server sends `<head>` and the shell first, so the browser starts fetching CSS and JS, then sends each Suspense boundary's HTML (with an inline script that swaps it into place) as its data resolves. Once the status code and headers are flushed you can't change them, so **decide redirects and 404s before streaming starts**, and render errors inside boundaries.

## A per-route decision framework

1. **Same for everyone, changes rarely** (docs, marketing, blog) → **SSG** on a CDN.
2. **Same for everyone, changes often, many pages** (product catalogue, listings) → **ISR**, or SSR behind a CDN with `s-maxage` + `stale-while-revalidate`, plus on-demand revalidation when the CMS publishes.
3. **Personalised, SEO or first-load speed matters** (home feed, search results) → **streaming SSR**. Static or cached shell, personalised parts streamed.
4. **Behind login, app-like, long sessions** (dashboards, editors) → **CSR** (or SSR shell + CSR) is fine. SEO is irrelevant, and repeat-visit caching of JS amortises the cost.

Also consider **edge rendering** for low TTFB globally, but only if your data is also close to the edge. Otherwise you just move the waterfall.

## Pitfalls

- **Hydration mismatches** from rendering time, locale or `window`-dependent output differently on server and client.
- SSR without caching under load. TTFB balloons and LCP gets *worse* than CSR.
- Treating ISR as "free": user A and user B may see different versions during revalidation, and purge semantics differ by hosting platform.
- Server-side waterfalls (sequential `await`s) that make SSR slow. Fetch in parallel.
- Leaking per-user data into a shared cache (personalised SSR with `public` caching).

## In an interview, mention…

- The table's core trade-off: freshness/personalisation vs speed/cost.
- Hydration cost as the reason SSR doesn't fix INP, and how RSC or islands help.
- Streaming mechanics and the headers-already-sent constraint.
- A real example of choosing different strategies for different routes in one product.
