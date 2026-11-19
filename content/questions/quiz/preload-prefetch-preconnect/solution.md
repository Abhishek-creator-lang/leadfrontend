## TL;DR

Resource hints tell the browser about work it would otherwise discover too late. **`preconnect`** opens the connection (DNS, TCP, TLS) to an origin early. **`dns-prefetch`** only resolves DNS. **`preload`** fetches a resource the *current* page definitely needs, at high priority. **`modulepreload`** does the same for ES modules and also parses them. **`prefetch`** fetches something the *next* navigation probably needs, at idle priority. Each one spends bandwidth, sockets or CPU, so **hint only what is critical and late-discovered**, and check the result in a waterfall.

## Side by side

| Hint | Scope | Cost if wrong | Typical use |
|---|---|---|---|
| `dns-prefetch` | DNS only | Negligible | Many third-party origins, or as a fallback alongside `preconnect` |
| `preconnect` | DNS + TCP + TLS | A socket and TLS handshake that may go unused (browsers close idle ones after ~10 s) | 1–3 critical origins: your API, image CDN, font host |
| `preload` | Fetch now, high priority, current page | Steals bandwidth from more important resources; console warning if unused within a few seconds | LCP image referenced only from CSS or JS, critical fonts, critical CSS from `@import` |
| `modulepreload` | Fetch, parse and compile an ES module | Same as preload | Deep module graphs where the browser would otherwise discover imports one level at a time |
| `prefetch` | Low priority, for future navigations | Wasted data, especially on metered connections | The next route's JS chunk on hover or idle |

```html
<link rel="preconnect" href="https://img.example-cdn.com">
<link rel="preload" href="/hero.avif" as="image" fetchpriority="high">
<link rel="preload" href="/fonts/brand.woff2" as="font" type="font/woff2" crossorigin>
<link rel="modulepreload" href="/assets/app-3f9a.js">
<link rel="prefetch" href="/assets/checkout-81bc.js">
```

### Details that bite

- **`as` is mandatory** for preload. It sets the priority, the `Accept` header and CSP checks. A missing or mismatched `as`, or mismatched `crossorigin`, means the cache entry isn't reused and the resource **downloads twice**.
- Preloading something the HTML already references in a plain `<img>` or `<script>` near the top is usually pointless. The preload scanner already finds it.
- Responsive images can be preloaded with `imagesrcset` and `imagesizes` on the `<link>`.
- `preconnect` to an origin that serves fonts or other CORS fetches needs `crossorigin`, because anonymous and credentialed requests use separate connections.

## Beyond `<link>` hints

- **103 Early Hints.** The server (or CDN) sends `Link: <...>; rel=preload` headers in an interim response while the real HTML is still being generated, so the browser can preconnect and preload during server think-time. Chromium supports preload and preconnect from Early Hints; check other browsers.
- **Speculation Rules API** (shipped in Chromium-based browsers; other engines are only experimenting, so treat it as progressive enhancement). A JSON `<script type="speculationrules">` block declares URLs to `prefetch` or fully `prerender`, with an `eagerness` setting such as `moderate` (on hover). Prerendering can make navigations feel instant, but the page runs before the user arrives, so analytics and side effects must wait for `document.prerendering` to end.
- **HTTP/2 Server Push** was removed from Chrome in 2022. Don't propose it. Early Hints is its replacement.

## Pitfalls

- "Preload everything" ends with the LCP image competing with twelve other high-priority requests.
- Preconnecting to ten origins. Each handshake costs CPU on low-end devices.
- Prefetching huge bundles for unlikely routes on mobile data. Respect `navigator.connection.saveData` where it's available.
- Leaving hints in after a refactor. Audit unused-preload warnings in the console.

## In an interview, mention…

- Current-page vs next-page hints, and the priority each gets.
- The `as` and `crossorigin` double-download trap.
- Early Hints and speculation rules as the modern tools, and Server Push as dead.
- That every hint is a bet: verify with a waterfall and field LCP, and remove the losers.
