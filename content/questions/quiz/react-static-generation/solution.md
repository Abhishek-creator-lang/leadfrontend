## TL;DR

Static site generation (SSG) renders React pages to **HTML at build time**, not per request. The output is plain files you can serve from a **CDN**, and the browser hydrates them (or, with Server Components, only the interactive parts). Benefits: **excellent TTFB and LCP** (cached at the edge), **very cheap, simple and resilient hosting** (no servers to scale or crash), **strong SEO**, and a small attack surface. Limits: content is **only as fresh as the last build**, build time grows with page count, and per-user personalization must happen on the client or at the edge. **Incremental Static Regeneration / revalidation** and on-demand revalidation bridge the freshness gap.

## How it works

At build time, the framework enumerates routes, fetches their data, and renders each to HTML (plus a data payload or RSC payload for client navigation):

```jsx
// Next.js App Router: statically rendered by default when no request-time APIs are used
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(p => ({ slug: p.slug }));
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <Article post={post} />;
}
```

Other tools: Astro (islands), Gatsby, Docusaurus, React Router's prerendering, and React 19's `prerender`/`prerenderToNodeStream` APIs in `react-dom/static` (which wait for all data before returning HTML) for building your own pipeline.

## Benefits

- **Speed:** HTML is precomputed and served from the nearest CDN node, so there's no server render or database query on the critical path.
- **Scalability and cost:** a traffic spike only hits the CDN.
- **Reliability:** if your API goes down, already-built pages still serve.
- **Security:** no runtime server code for those pages means less to attack.
- **SEO:** complete HTML for crawlers.

## Limitations and solutions

| Limitation | Mitigation |
|---|---|
| Stale content between builds | Time-based revalidation (ISR), on-demand revalidation from a CMS webhook |
| Long builds for thousands of pages | Pre-build only popular pages, render the rest on first request and cache them |
| Per-user content (cart, name) | Fetch on the client after hydration, or use edge middleware, or partial prerendering (a static shell with dynamic holes streamed in) |
| Request-time data (cookies, headers) | Those routes must be dynamic (SSR) |

## Choosing between SSG, SSR and CSR

- **SSG:** marketing pages, docs, blogs, product catalogs with periodic updates.
- **SSR:** personalized, fast-changing or auth-dependent pages that still need SEO.
- **CSR:** app-like, logged-in dashboards.

Modern frameworks let you choose **per route**, or even mix static shells with dynamic sections.

## Pitfalls

- Treating build-time data as live (prices, stock levels) without revalidation.
- Hydration mismatches when client-only values (dates relative to "now", the user's locale) are baked in at build time.
- Large client bundles. Static HTML doesn't help INP if every page still hydrates a heavy tree. RSC and islands reduce that.

## In an interview, mention…

- Build-time rendering, CDN delivery, and hydration on the client.
- Benefits: performance, cost, reliability and SEO. Limitation: freshness.
- ISR / on-demand revalidation and partial prerendering as hybrids.
- Picking a rendering strategy per route based on how fresh and how personalized the content is.
