## TL;DR

Code splitting breaks your JavaScript bundle into **chunks that load on demand** instead of shipping the whole app up front. The bundler (Vite/Rollup, webpack, Turbopack) creates a split point at every **dynamic `import()`**. In React you use **`React.lazy`** to turn a dynamic import into a component and **`<Suspense>`** to show a fallback while the chunk loads. Split by **route** first, then by **heavy, rarely used features** (editors, charts, modals). Frameworks such as Next.js and React Router split routes automatically, and Server Components avoid shipping server-only code at all.

## Basic pattern

```jsx
import { lazy, Suspense, useState } from 'react';

const ChartPanel = lazy(() => import('./ChartPanel')); // must default-export a component

function Dashboard() {
  const [showChart, setShowChart] = useState(false);
  return (
    <>
      <button onClick={() => setShowChart(true)}>Show chart</button>
      {showChart && (
        <Suspense fallback={<Spinner label="Loading chart" />}>
          <ChartPanel />
        </Suspense>
      )}
    </>
  );
}
```

`ChartPanel` and its dependencies (say, a 200 KB charting library) are fetched only when the user asks for them.

For named exports:

```jsx
const Editor = lazy(() => import('./editor').then(m => ({ default: m.Editor })));
```

## Route-level splitting

```jsx
const Settings = lazy(() => import('./routes/Settings'));

<Route path="/settings" element={
  <Suspense fallback={<PageSkeleton />}><Settings /></Suspense>
} />
```

Each route ships only what it needs. React Router's route `lazy` option and Next.js's file-based routing do this per route automatically.

## Avoiding a slow experience

Splitting trades initial load for **later loading delays**. Mitigate with:

- **Prefetching** on intent: call the `import()` on hover/focus of a link or button, or when the browser is idle. Calling the same `import()` again reuses the in-flight or cached module.

```jsx
const loadChart = () => import('./ChartPanel');
const ChartPanel = lazy(loadChart);
<button onMouseEnter={loadChart} onFocus={loadChart} onClick={…}>
```

- **Good fallbacks:** skeletons sized like the final content to avoid layout shift (CLS).
- **Transitions:** wrapping the navigation in `startTransition` keeps the old UI on screen instead of flashing a fallback for an already-visible boundary.
- **Error handling:** chunk loads can fail (deploys that remove old chunks, flaky networks). Wrap lazy content in an error boundary with a retry or reload.

## What to split (and what not to)

- Good candidates: routes, admin-only areas, rich text editors, maps, charts, PDF viewers, rarely opened dialogs, locale data, polyfills.
- Bad candidates: tiny components (request overhead outweighs the savings), anything above the fold on the critical path.
- Watch for **shared dependencies** being duplicated or pulled into the main chunk. Use a bundle analyzer (`rollup-plugin-visualizer`, `webpack-bundle-analyzer`).

## SSR and Server Components

- `lazy` works with streaming SSR in React 18+: the server streams fallbacks and later content, and selective hydration loads chunks per boundary.
- With **RSC**, Server Components contribute **zero client JS**, and `'use client'` boundaries are natural split points. The framework handles chunking.

## In an interview, mention…

- `import()` creates chunks, `lazy` + `Suspense` render them, and you split by route first.
- The trade-off: smaller initial bundle vs on-demand latency, mitigated by prefetching, transitions and skeletons.
- Error boundaries for chunk-load failures after deployments.
- Measure with a bundle analyzer and Core Web Vitals. RSC reduces client JS structurally.
