## TL;DR

`<Suspense fallback={…}>` lets a part of the tree **declare "I'm not ready yet"** by *suspending*, and React shows the **nearest boundary's fallback** until it's ready. It enables **declarative loading states** in place of `isLoading` flags spread through every component. It works with **lazy-loaded code** (`React.lazy`), **Suspense-enabled data** (framework data loading, Server Components, `use(promise)` in React 19, libraries like TanStack Query's `useSuspenseQuery`), **streaming SSR** (send the HTML shell first, stream boundaries as they resolve), and **selective hydration**. Combined with transitions, it lets React **keep showing old content** instead of flashing spinners.

## Basic usage

```jsx
<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Suspense fallback={<FeedSkeleton />}>
    <Feed />          {/* suspends while data loads */}
  </Suspense>
  <Suspense fallback={<SidebarSkeleton />}>
    <Sidebar />       {/* lazy-loaded chunk */}
  </Suspense>
</Suspense>
```

Nesting boundaries controls the **loading sequence**: the header appears immediately, and the feed and sidebar reveal independently. Everything inside one boundary reveals together, so you design the boundaries around what users should see as a unit.

## What can suspend

- `React.lazy(() => import('./X'))` while the chunk loads.
- `use(promise)` (React 19) while a **cached** promise is pending.
- Async Server Components (`async function Page() { await … }`) on the server.
- Suspense-enabled libraries and frameworks.

**Not** data fetched in `useEffect`. Effects run after commit, so React has nothing to suspend on. Suspense isn't a generic "await anything" wrapper, and the mechanism for libraries is an implementation detail you shouldn't hand-roll.

## Transitions and avoiding fallback flashes

If an already-visible boundary suspends during an **urgent** update, React replaces the content with the fallback. If the update is wrapped in **`startTransition`** (which router navigations usually are), React **keeps the previous UI** visible and you can show an inline `isPending` indicator instead. `useDeferredValue` gives a similar "show stale while fresh loads" behaviour for values.

## Server rendering

- **Streaming:** `renderToPipeableStream`/`renderToReadableStream` send the shell with fallbacks immediately, then stream each boundary's HTML (plus a small inline script to swap it in) when its data resolves. Slow data no longer blocks TTFB for the whole page.
- **Selective hydration:** each boundary hydrates independently, and boundaries the user interacts with are hydrated first.

## Version notes

- **React 16.6:** `lazy` + Suspense on the client only.
- **React 18:** Suspense on the server (streaming), transitions, selective hydration.
- **React 19:** `use(promise)`. Siblings of a suspended component are no longer all pre-rendered before showing the fallback: React commits the fallback sooner, then "pre-warms" siblings. 19.2 also batches the reveal of streamed boundaries for smoother loading.

## Pitfalls

- Creating promises during render (`use(fetch(…))`) means a new promise every render, which suspends forever. Promises must be cached or created outside render.
- One boundary at the root shows a full-page spinner for any small suspension.
- Boundaries that are too granular produce "popcorn" UI and layout shifts. Size skeletons to match the content.
- Errors from suspended work go to **error boundaries**, so pair them.

## In an interview, mention…

- Declarative loading boundaries, and that components suspend when not ready.
- What can suspend (lazy, `use`, frameworks, RSC) and what can't (effects).
- Transitions to keep old UI visible, and how boundaries shape the reveal order.
- Streaming SSR and selective hydration, plus the React 19 changes.
