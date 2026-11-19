## TL;DR

In **development with `<StrictMode>`** (React 18+), React **mounts each component, immediately simulates an unmount (running effect cleanups), and mounts it again (running setups again)**. That's why `useEffect(() => {...}, [])` appears to run twice. It's deliberate: it verifies that **every effect's cleanup correctly undoes its setup**, so components stay correct when React unmounts and remounts them (Fast Refresh, `<Activity>`, back/forward navigation, future features). **Production runs effects once.** The fix is almost never "prevent the second run". **Write the cleanup**, so setup → cleanup → setup behaves like a single setup.

## Seeing it

```jsx
useEffect(() => {
  console.log('connect');
  const conn = createConnection(roomId);
  conn.connect();
  return () => {
    console.log('disconnect');
    conn.disconnect();
  };
}, [roomId]);
// Development: connect, disconnect, connect
// Production:  connect
```

Without the cleanup, development shows **two** live connections, exposing a leak that would also appear in production whenever `roomId` changes or the component remounts.

## Fix patterns by effect type

**Subscriptions and listeners:** remove them in the cleanup.

```jsx
useEffect(() => {
  const onResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}, []);
```

**Data fetching:** ignore or abort the stale request.

```jsx
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/items?q=${q}`, { signal: controller.signal })
    .then(r => r.json())
    .then(setItems)
    .catch(e => { if (e.name !== 'AbortError') setError(e); });
  return () => controller.abort();
}, [q]);
```

Development still sends two requests (the first is aborted). That's fine. Better still, use a data library or framework loader that **caches and deduplicates**.

**Third-party widgets:** destroy the instance in the cleanup (`map.remove()`, `chart.destroy()`).

**Animations:** reset to the initial state in the cleanup.

**Analytics "page view":** the dev double-fire is harmless. If it pollutes dev data, disable analytics in development rather than distorting the code.

## Things that are not effects

- **App-wide one-time initialization** (SDK setup, loading auth from storage) belongs **outside components**, at module level or behind a module-scoped `didInit` flag, not in an effect with `[]`.
- **User-triggered actions** (buying a product, sending a form) belong in **event handlers**. If an effect POSTs on mount, a double-run reveals a design problem: the request shouldn't be tied to rendering.

## Anti-patterns to avoid

```jsx
// Hiding the symptom
const ran = useRef(false);
useEffect(() => {
  if (ran.current) return;
  ran.current = true;
  subscribe(); // never unsubscribed, still a leak
}, []);
```

Also avoid removing `<StrictMode>` to "fix" it. You lose the check, and the bug remains for real remounts.

## Related Strict Mode behaviours

- Components, initializers, updaters and reducers **render twice** to catch impure render logic.
- **React 19:** ref callbacks are also run twice on mount (attach, cleanup, attach), and `useMemo`/`useCallback` reuse results from the first render during the double render.

## In an interview, mention…

- It's development-only, mount → unmount → mount, to verify cleanups. Production runs once.
- Fix it with symmetric cleanup (unsubscribe, abort, destroy), not with ref guards.
- Fetch duplication is handled with abort plus caching libraries.
- Module-level init for true once-per-app work, and event handlers for user actions.
