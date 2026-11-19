## TL;DR

Streaming SSR (React 18+) sends HTML **progressively** instead of waiting for the whole page. React renders until it hits `<Suspense>` boundaries that are still waiting (on data or code), **flushes the "shell"** with the fallbacks right away, then, as each boundary resolves, **streams its HTML plus a tiny inline script** that swaps it into place. On the client, **selective hydration** hydrates each boundary independently and **prioritizes the ones the user interacts with**. The result is a faster TTFB/FCP, slow data no longer blocking the whole page, and earlier interactivity. APIs: **`renderToPipeableStream`** (Node streams) and **`renderToReadableStream`** (Web streams: Deno, Bun, edge runtimes, and Node 18+).

## Old vs new

**`renderToString` (pre-18):** fetch *all* data, render *all* HTML, send it, load *all* JS, hydrate *everything* at once. The slowest piece gates every step.

**Streaming:**

```jsx
function ProductPage() {
  return (
    <Layout>
      <ProductInfo />                               {/* in the shell */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews />                                 {/* slow query, streamed later */}
      </Suspense>
      <Suspense fallback={<RecsSkeleton />}>
        <Recommendations />                         {/* streamed when ready */}
      </Suspense>
    </Layout>
  );
}
```

```js
const { pipe, abort } = renderToPipeableStream(<App />, {
  bootstrapScripts: ['/client.js'],
  onShellReady() {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    pipe(res);
  },
  onShellError() {
    res.statusCode = 500;
    res.send('<h1>Something went wrong</h1>');
  },
  onAllReady() { /* use this instead of onShellReady for crawlers or static generation */ },
  onError(err) { console.error(err); },
});
setTimeout(() => abort(), 10_000); // give up on slow boundaries; the client renders them instead
```

## What the browser receives

1. The shell HTML with fallback placeholders, so the user sees the layout and skeletons immediately.
2. Later chunks: `<div hidden id="S:1">…reviews HTML…</div><script>$RC("B:1","S:1")</script>`, which moves the content into place. This works before React's JS has even loaded.
3. JS bundles load, and `hydrateRoot` hydrates boundaries as their code and HTML arrive. Clicking an unhydrated boundary bumps its priority, and React replays the event after hydrating.

## Design considerations

- **Where to put boundaries:** around independent, slow or below-the-fold regions. The shell should contain what matters for LCP. Don't put the hero image behind a boundary.
- **Status codes and headers** must be decided before the shell flushes. An error discovered later inside a boundary can't change the 200. React renders that boundary on the client and reports the error. Plan redirects and 404s (route-level checks) before streaming.
- **SEO:** crawlers get the full content (the stream completes), but for bots you may wait for `onAllReady` to send complete HTML at once.
- **Infrastructure:** proxies, CDNs and compression must not buffer the response (watch nginx `proxy_buffering`, and some serverless platforms).
- **Head management:** React 19 hoists `<title>`, `<meta>` and `<link>` rendered anywhere into `<head>`, and supports stylesheet precedence and resource preloading (`preload`, `preinit`), which helps streamed content load styles in time.
- **React 19.2** batches the reveal of streamed boundaries for a short period to reduce "popcorn" layout jumps, and adds partial prerendering APIs (`prerender` + `resume`) to serve a static shell from a CDN and stream the dynamic parts.

## With Server Components

Frameworks combine RSC with streaming. Async Server Components suspend naturally, so `await` in a component plus a Suspense boundary above it is all you need to stream that region.

## In an interview, mention…

- Shell first, then boundaries streamed with inline swap scripts. Slow data no longer blocks TTFB.
- `renderToPipeableStream` vs `renderToReadableStream`, and `onShellReady` vs `onAllReady`.
- Selective hydration and interaction-prioritized hydration with event replay.
- Practical gotchas: status codes after flush, buffering proxies, boundary placement for LCP and CLS.
