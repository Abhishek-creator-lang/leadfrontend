## TL;DR

**Hydration** is the step where React, running in the browser, **attaches to HTML that was already rendered on the server**. Instead of throwing that HTML away and rebuilding the DOM, React renders the same component tree in memory, **walks the existing DOM, adopts its nodes, and attaches event handlers and state**, which makes the static page interactive. It's done with `hydrateRoot(container, <App />)` (React 18+). It only works if the **client's first render produces the same markup as the server's**. Otherwise you get hydration mismatch errors.

## Why hydrate rather than render?

Server-side rendering gives users meaningful HTML fast (better FCP/LCP, SEO, works before JS loads). But that HTML is inert: buttons don't respond until JavaScript runs. Hydration connects the two without re-creating the DOM, so:

- There's no flash or layout shift from replacing server markup.
- Focus, scroll position and any text the user already selected are preserved.
- It's cheaper than a full client render plus DOM creation.

```jsx
// client entry
import { hydrateRoot } from 'react-dom/client';
import App from './App';

hydrateRoot(document.getElementById('root'), <App />);
```

Frameworks such as Next.js and React Router do this for you.

## How React 18 improved it

**Before (React 17 and earlier):** hydration was all-or-nothing. The whole app's JS had to load, and the whole tree hydrated in one blocking pass before anything was interactive.

**React 18:**

- **Streaming SSR + Suspense:** the server can send HTML in chunks as data becomes ready.
- **Selective hydration:** each `<Suspense>` boundary hydrates independently. Code-split parts can hydrate later.
- **Prioritized by interaction:** if the user clicks inside a not-yet-hydrated boundary, React hydrates that boundary first and replays the event.
- Hydration is **concurrent**, so it yields to the browser rather than blocking the main thread for the whole tree.

**React 19:** clearer mismatch error messages with a diff, tolerance for extra nodes injected by browser extensions or third-party scripts in `<head>`/`<body>`, and the `onRecoverableError` root option for reporting recovered mismatches.

## The cost: hydration isn't free

The client still downloads, parses and executes all component code for the hydrated tree, and re-renders it. That's the "uncanny valley" where a page looks ready but doesn't respond (bad for INP/TBT). Mitigations:

- Split code so non-critical widgets load and hydrate later (`lazy` + `Suspense`).
- **React Server Components:** server-only components ship **no JS and don't hydrate at all**. Only `'use client'` islands hydrate.
- Keep the client tree small, and defer third-party scripts.

## Pitfalls

- **Mismatches:** `Date.now()`, `Math.random()`, `typeof window` branches, locale/time-zone formatting, or reading `localStorage` during render produce different output on client and server. Move client-only values into `useEffect`, or use `useSyncExternalStore` with a `getServerSnapshot`.
- **Invalid HTML nesting** (`<p><div/></p>`, `<a>` inside `<a>`) is repaired by the browser's parser, so the DOM no longer matches what React expects.
- **Calling `createRoot` instead of `hydrateRoot`** on SSR markup discards it and renders from scratch.

## In an interview, mention…

- Hydration adopts server HTML and attaches behaviour. It requires the first client render to match.
- React 18's streaming, selective and interaction-prioritized hydration.
- The cost of hydration and how RSC and code splitting reduce it.
- Common causes of mismatches and how to fix them.
