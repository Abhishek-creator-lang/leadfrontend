## TL;DR

A hydration mismatch happens when **the HTML rendered on the server differs from what the client's first render produces**. React expects them to match so it can adopt the existing DOM. Typical causes: **non-deterministic values** (`Date.now()`, `Math.random()`, generated ids), **environment branches** (`typeof window`, `localStorage`, `navigator`, media queries) during render, **locale and time-zone differences** in formatting, **invalid HTML nesting** the browser silently repairs, **different data** on server and client, and **browser extensions or third-party scripts** modifying the DOM. Fix them by **making the first client render identical** and deferring client-only values to **after hydration** (effects, `useSyncExternalStore` with a server snapshot), or by using `suppressHydrationWarning` for small, intentional text differences such as timestamps.

## What React does on a mismatch

- **React 18:** recoverable errors. React discards the server HTML up to the nearest Suspense boundary (or the root) and **client-renders** that part, which is slower and can flash, and logs errors that often didn't say where the problem was.
- **React 19:** still recovers by client-rendering, but logs **one error with a diff** showing the server vs client values and the component path. It also tolerates unexpected tags inserted by extensions or scripts in `<head>`/`<body>`, and you can report recovered errors with `hydrateRoot(..., { onRecoverableError })`.

Attribute mismatches (as opposed to text or structure) are generally **not patched**: React warns in development and leaves the server value in place, which can leave subtle bugs.

## Common causes and fixes

**1. Time and randomness**

```jsx
// Bug: server and client render at different times
<p>Updated {new Date().toLocaleTimeString()}</p>
```

Fix: render a stable value (pass the timestamp from the server as data), format with an explicit locale and time zone, or render the relative time after mount. For a single text node that's legitimately different, `<time suppressHydrationWarning>` silences the warning (one level deep only).

**2. Client-only APIs in render**

```jsx
// Bug
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
```

```jsx
// Fix: same output on the server and on the first client render, then update
const [isMobile, setIsMobile] = useState(false);
useEffect(() => setIsMobile(window.innerWidth < 768), []);
```

Better still, use CSS media queries for layout, or `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)` where `getServerSnapshot` returns the server-safe value.

**3. Ids:** use `useId`, not counters or random values.

**4. Invalid nesting:** `<p><div /></p>`, `<a>` inside `<a>`, `<tr>` directly inside `<table>` without `<tbody>`. The parser restructures the HTML, so the DOM no longer matches. Fix the markup.

**5. Data drift:** the client fetches fresh data before hydrating instead of using the serialized server data. Hydrate with the same payload (frameworks handle this) and refetch after.

**6. Locale and user state:** cookies or Accept-Language-based formatting must use the same inputs on both sides. Pass locale and time zone explicitly.

**7. Extensions and third-party scripts:** React 19 is more tolerant at the document level. Otherwise, render those regions only on the client.

## Client-only components

For widgets that can't render on the server (maps, canvas editors), render a placeholder on the server and the real component after mount, or use a framework's `ssr: false` dynamic import. Wrap them in Suspense so they don't block hydration.

## In an interview, mention…

- Why matching matters (React adopts the DOM) and what React does on failure (client re-render, plus a better diff in 19).
- Concrete causes: time, randomness, `window`, locale, nesting, data.
- Fixes: deterministic render, effects or `useSyncExternalStore` server snapshots, `useId`, `suppressHydrationWarning` sparingly.
- Monitoring with `onRecoverableError`, because mismatches cost performance silently.
