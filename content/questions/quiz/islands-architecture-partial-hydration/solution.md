## TL;DR

With full hydration, the server renders HTML and then the client downloads JS for the **entire** component tree and re-runs it to attach behaviour, even for parts that never change. **Islands architecture** renders the page as **static HTML by default** and hydrates only **independent interactive widgets** ("islands"), each with its own JS bundle and its own hydration trigger (on load, when idle, when visible). The result is much less JavaScript and better INP on **content-heavy sites**. The trade-off: islands don't share a component tree, so **cross-island state and app-like navigation are harder**.

## Picture it

```
┌──────────────────── static HTML (no JS) ─────────────────────┐
│ Header (static)        [Search box ← island, hydrate on idle] │
│ Article body (static, thousands of nodes)                     │
│ [Image carousel ← island, hydrate when visible]               │
│ Footer (static)        [Newsletter form ← island, on visible] │
└───────────────────────────────────────────────────────────────┘
```

```html
---
// Astro example
import Carousel from '../components/Carousel.jsx';
import Search from '../components/Search.svelte';
---
<article set:html={post.html} />
<Search client:idle />
<Carousel client:visible images={post.images} />
```

Without a `client:*` directive, the component renders to HTML on the server and ships **zero JS**. Islands can even use different UI frameworks.

## Comparing approaches to the hydration problem

| Approach | Idea | Examples | Strength | Weakness |
|---|---|---|---|---|
| Full hydration | Re-run the whole tree on the client | Classic SSR React/Vue apps | Simple mental model; one app | JS cost ∝ page size |
| Progressive / selective hydration | Hydrate the whole tree, but in chunks by priority | React 18 Suspense hydration | Better INP during load | Still ships all the JS |
| Islands / partial hydration | Hydrate only marked components | Astro, Eleventy + WebC, Fresh | Minimal JS for content sites | Island isolation; shared state needs stores or events |
| Server Components | Components that run only on the server, so their code never ships; client components are the interactive "holes" | React Server Components (Next.js App Router, others) | Fine-grained split inside one React tree, server data access | Framework coupling, new mental model, serialisation boundaries |
| Resumability | Serialise state and listeners into HTML; load handler code lazily on interaction, with no replay | Qwik | Near-zero startup JS | Different programming model, many tiny lazy chunks |

RSC and islands share the same goal (don't ship JS for non-interactive UI) but come from opposite defaults. Islands are **static by default, opt in to interactivity**. RSC is **a React tree where server components are the default and client components opt in**, and routing stays app-like.

## When islands fit

- **Good fit**: marketing sites, docs, blogs, news, e-commerce product and listing pages. Mostly content, with a few widgets.
- **Poor fit**: highly interactive apps (dashboards, editors, chat) where most of the page is stateful and shares state. Then you want an SPA or RSC-style app.

## Practical concerns

- **Shared state** between islands: use a tiny framework-agnostic store (e.g. nanostores), custom events, or the URL.
- **Navigation**: multi-page navigations by default. Cross-document **view transitions** and **speculation rules** prefetch or prerender can make an MPA feel app-like.
- **Hydration triggers**: `visible` defers JS cost, but the first interaction may wait for download. Prefetch on hover or near-viewport for critical widgets.
- **Consistency**: islands rendered by different frameworks add bundle overhead (each framework's runtime). Standardise where you can.

## In an interview, mention…

- The cost being avoided: hydration JS for static content, which hurts INP and TBT.
- Islands vs progressive hydration vs RSC vs resumability, with one sentence each.
- Fit by product type and the state-sharing trade-off.
- How you'd measure the gain: JS bytes per route, TBT, field INP.
