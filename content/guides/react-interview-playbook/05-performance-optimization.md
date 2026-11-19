---
title: Performance optimization
description: A measure-first approach to React performance, covering re-render control, memoization, React Compiler, transitions, code splitting, virtualization, and profiling, for React 18 and 19.
source: original
---
React performance questions test judgment more than trivia. The interviewer wants to know whether you **measure before optimizing**, whether you understand *why* a component is slow, and whether you reach for structural fixes before adding memoization everywhere.

## The workflow

```mermaid
flowchart LR
  Observe[Observe symptom] --> Measure[Measure with Profiler and Performance panel]
  Measure --> Diagnose[Find the cause]
  Diagnose --> Fix[Apply the smallest fix]
  Fix --> Verify[Re-measure]
  Verify --> Guard[Guard with budgets and RUM]
```

Typical symptoms: slow typing (high INP), janky scrolling, slow initial load (LCP), or memory growth.

## Tools

| Tool | Use it for |
| --- | --- |
| React DevTools Profiler | Which components rendered, why ("What caused this update?"), and how long each took |
| "Highlight updates when components render" | Quick visual check of re-render scope |
| Chrome Performance panel | Long tasks, scripting vs layout vs paint, interaction timings; React 19.2 adds custom React tracks |
| Lighthouse / PageSpeed Insights | Lab metrics and loading opportunities |
| `web-vitals` library + RUM | Real-user LCP, INP, CLS |
| Bundle analyzers (e.g. rollup-plugin-visualizer, webpack-bundle-analyzer) | What's in your JS |

Profile **production builds** where possible. Development builds include extra checks and Strict Mode double-rendering, which distort timings.

## Category 1: too many re-renders

### Fix 1: move state down (colocation)

```jsx
// Before: typing re-renders the whole page
function Page() {
  const [query, setQuery] = useState('');
  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ExpensiveChart />
      <ExpensiveTable />
    </>
  );
}

// After: only SearchBox re-renders on input
function SearchBox() {
  const [query, setQuery] = useState('');
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
function Page() {
  return (<><SearchBox /><ExpensiveChart /><ExpensiveTable /></>);
}
```

### Fix 2: lift content up (children as props)

```jsx
function ScrollTracker({ children }) {
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div data-scrolled={y > 0}>{children}</div>;
}

// <ExpensiveTree /> is created by the parent, so it doesn't re-render when y changes
<ScrollTracker><ExpensiveTree /></ScrollTracker>
```

### Fix 3: split context

Separate frequently changing values from stable ones, and memoize provider values. For high-frequency shared state, use a store with selectors.

### Fix 4: memoize at boundaries

```jsx
const Row = memo(function Row({ item, onSelect }) {
  return <li onClick={() => onSelect(item.id)}>{item.label}</li>;
});

function List({ items }) {
  const [selected, setSelected] = useState(null);
  const handleSelect = useCallback((id) => setSelected(id), []);
  return <ul>{items.map((it) => <Row key={it.id} item={it} onSelect={handleSelect} />)}</ul>;
}
```

`memo` only helps if **all** props are referentially stable. One inline object or arrow function defeats it. That's why `memo`, `useCallback`, and `useMemo` tend to be needed together.

## React Compiler

React Compiler is a build-time tool (Babel plugin, with integrations for Vite, Next.js, and others) that automatically memoizes components, hooks, and values based on its analysis of your code. Key facts for interviews:

- Reached a **stable 1.0 release in 2025**. Works best with React 19, and supports React 17 and 18 through the `react-compiler-runtime` package.
- Requires code that follows the **Rules of React**: pure renders, no mutating props or state, and hooks rules. It skips components it can't safely optimize.
- Pair it with the compiler-aware ESLint rules (now part of `eslint-plugin-react-hooks`) to surface violations.
- It reduces the need for manual `memo` / `useMemo` / `useCallback`, but **doesn't** fix expensive algorithms, oversized bundles, or huge DOMs.

**Adoption advice (lead-level):** enable it incrementally (per directory or with an opt-in annotation), compare render counts and INP before and after, and keep existing manual memoization until you've verified it's safe to remove.

## Category 2: expensive renders

- **Expensive computations:** `useMemo` with correct deps, or move the work to a Web Worker.
- **Large lists:** virtualize (TanStack Virtual, react-window, react-virtuoso) so only visible rows mount.
- **Non-urgent updates:** wrap them in `startTransition` so urgent input stays responsive.

```jsx
function Search({ items }) {
  const [text, setText] = useState('');
  const deferredText = useDeferredValue(text);
  const filtered = useMemo(
    () => items.filter((i) => i.name.toLowerCase().includes(deferredText.toLowerCase())),
    [items, deferredText]
  );
  const isStale = text !== deferredText;
  return (
    <>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <ul style={{ opacity: isStale ? 0.6 : 1 }}>
        {filtered.map((i) => <li key={i.id}>{i.name}</li>)}
      </ul>
    </>
  );
}
```

`useDeferredValue` only helps if the expensive child can skip rendering when its input hasn't changed, so the list must be memoized (via `useMemo` as above, `memo` on a child component, or React Compiler).

## Category 3: slow loading

| Technique | How |
| --- | --- |
| Route-level code splitting | `lazy(() => import('./Settings'))` plus `<Suspense>` |
| Defer heavy widgets | Load on interaction or visibility |
| Reduce hydration cost | Server Components (no client JS for server-only parts), streaming SSR with Suspense boundaries, selective hydration |
| Preload critical resources | React 19 `preload`, `preinit`, `preconnect` from `react-dom`; `<link rel="preload">` |
| Optimize images | Responsive sizes, modern formats, explicit dimensions |
| Trim dependencies | Replace heavy libraries (moment → `Intl` / date-fns), avoid barrel imports |

```jsx
import { lazy, Suspense } from 'react';
const Settings = lazy(() => import('./Settings'));

<Suspense fallback={<PageSkeleton />}>
  <Settings />
</Suspense>
```

## Category 4: memory and leaks

- Clean up subscriptions, intervals, observers, and listeners in effect cleanups.
- Abort in-flight requests on unmount or when parameters change.
- Watch for caches that grow without bounds (memoization by id across sessions).
- Detached DOM nodes held by refs or closures: use heap snapshots to find them.

## Category 5: interaction latency (INP)

- Keep event handlers light. Defer analytics and non-critical work (`requestIdleCallback`, `scheduler.yield()` where supported, or `setTimeout`).
- Avoid synchronous layout thrashing (reading layout and writing styles in loops).
- Use transitions for updates that trigger large re-renders.
- Hydration blocks interactions on SSR pages. Selective hydration in React 18+ prioritizes the part the user interacts with, but smaller client bundles still help most.

## Anti-patterns interviewers flag

| Anti-pattern | Why it's wrong |
| --- | --- |
| `useMemo` around trivial values | Adds overhead and noise with no benefit |
| `memo` on every component | Comparison cost; often defeated by unstable props |
| Inline objects passed to memoized children | Breaks memoization every render |
| Using index keys for dynamic lists | Remounts, state bugs, wasted DOM work |
| Global context for rapidly changing values | Re-renders every consumer |
| Optimizing without profiling | Fixes the wrong thing |

## A model interview answer

> "First I'd reproduce it with a production build and profile it: React Profiler to see which components re-render and why, and the Performance panel to see whether it's scripting, layout, or paint. In my experience it's usually state that's too high. A search input at the page level re-renders everything, so I'd colocate it. If a large list is involved, I'd virtualize. For updates that are genuinely heavy, I'd use `useDeferredValue` so typing stays responsive. I'd memoize at clear boundaries, or rely on React Compiler if the codebase has it. Then I'd verify with INP from RUM, and add a CI budget so it doesn't regress."

## Lead-level additions

- **Budgets:** per-route JS budgets and INP/LCP targets owned by teams, enforced in CI and monitored in RUM dashboards.
- **Platform defaults:** design-system components that are fast by default (virtualized tables, optimized images).
- **Compiler rollout plan:** lint compliance first, incremental enablement, metric comparison, then removal of manual memoization.
- **Education:** a short internal guide on colocation and composition fixes most problems before they need memoization.
