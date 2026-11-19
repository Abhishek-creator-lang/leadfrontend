## TL;DR

Server-side rendering (SSR) runs your React components **on the server for each request** and sends **ready-made HTML** to the browser, which then downloads the JS and **hydrates** it to make it interactive. Benefits: **faster first paint and LCP** (content visible before JS runs), **better SEO and link previews**, content that works for users with slow devices or failed JS, and access to request-time data (cookies, auth, personalization). Costs: **server compute and complexity**, slower **TTFB** if data fetching blocks, and the **hydration cost** remains. React 18 added **streaming SSR with Suspense and selective hydration**, and React 19 adds **Server Components** to cut the client JS.

## How it works

```jsx
// server (Node), simplified
import { renderToPipeableStream } from 'react-dom/server';

app.get('*', (req, res) => {
  const { pipe } = renderToPipeableStream(<App url={req.url} />, {
    bootstrapScripts: ['/client.js'],
    onShellReady() {
      res.setHeader('Content-Type', 'text/html');
      pipe(res); // start streaming as soon as the shell is ready
    },
    onError(err) { console.error(err); },
  });
});

// client.js
hydrateRoot(document, <App url={location.pathname} />);
```

In practice you use a framework (Next.js, React Router v7 framework mode, Remix, TanStack Start) that handles routing, data loading, bundling and caching.

## Request lifecycle

1. The request arrives, and the server fetches data and renders to HTML (streaming chunks as Suspense boundaries resolve).
2. The browser paints the HTML immediately. Content is **visible but not interactive**.
3. JS bundles load, and `hydrateRoot` attaches handlers. Boundaries hydrate selectively, prioritizing what the user interacts with.
4. From then on the app behaves like a client-rendered SPA (client-side navigation).

## Benefits in detail

- **Performance perception:** FCP and LCP improve because the browser doesn't wait for JS to see content. This matters most on slow devices and networks.
- **SEO and social:** crawlers and link unfurlers get full HTML. Google executes JS, but with delays and limits, and many bots don't.
- **Personalized and fresh content** at request time, unlike static generation.
- **Data locality:** fetching from the server near the database avoids client round trips.

## Costs and trade-offs

- **TTFB:** waiting for slow data before sending anything hurts. Streaming fixes this: send the shell immediately and stream slow parts behind Suspense.
- **Hydration cost:** the page can look ready but not respond (hurting INP). RSC, code splitting and smaller client trees help.
- **Server load and ops:** you need servers or edge functions, caching (CDN, `stale-while-revalidate`) and monitoring.
- **Isomorphic constraints:** no `window` during render, and output must match on client and server to avoid hydration errors.

## SSR vs alternatives

| | When |
|---|---|
| CSR (SPA) | Authenticated dashboards where SEO doesn't matter |
| SSG | Content that's the same for everyone and changes rarely |
| ISR / revalidation | Mostly static content with periodic updates |
| SSR (streaming) | Personalized or frequently changing, SEO-relevant pages |
| RSC + SSR | Modern default in frameworks: server-only components plus streaming |

## In an interview, mention…

- Render to HTML on request, then hydrate. Separate "visible" from "interactive".
- React 18's `renderToPipeableStream`/`renderToReadableStream`, streaming and selective hydration (vs the old blocking `renderToString`).
- Trade-offs: TTFB, server cost, hydration cost, and mismatch risks.
- How RSC changes the picture (no hydration for server-only components) and when SSG/ISR is a better fit.
