## TL;DR

`<StrictMode>` is a **development-only** wrapper that **stress-tests components for bugs that concurrent React would expose**. It renders nothing visible and **has no effect in production builds**. Inside it, React: **double-invokes render logic** (component bodies, state initializers, updaters, reducers, `useMemo` callbacks) to catch impure rendering; **runs an extra setup → cleanup cycle for every effect** on mount to catch missing cleanups; in React 19 also **runs ref callbacks an extra time** on mount; and **warns about deprecated APIs** (legacy lifecycles, string refs, `findDOMNode`).

## Enabling it

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

You can wrap only part of the tree to adopt it incrementally. Most frameworks enable it by default.

## The checks and what they catch

**1. Double rendering: impure render logic**

```jsx
function Cart({ items }) {
  items.push({ id: 'promo' }); // mutation during render
  return <List items={items} />;
}
```

Rendering twice makes the promo appear twice, which exposes the mutation. Rendering must be pure because concurrent React may render a component several times before committing, or throw a render away.

React 17 silenced `console.log` during the second render, which confused people. React 18 stopped hiding it, and React DevTools can show those logs dimmed instead. In React 19, `useMemo` and `useCallback` reuse their result from the first render during the second.

**2. Effect double-run: missing cleanup**

```jsx
useEffect(() => {
  const socket = connect(roomId);
  return () => socket.disconnect(); // without this, Strict Mode leaves two connections open
}, [roomId]);
```

React mounts, simulates an unmount (runs cleanup), then mounts again. If the user-visible behaviour differs from a single mount, your cleanup is wrong. This also prepares for features that preserve state while unmounting UI, such as `<Activity>` (stable in React 19.2), which can hide and reshow trees.

**3. Ref callbacks (React 19):** callback refs are attached, cleaned up and re-attached, to validate ref cleanup functions.

**4. Deprecated API warnings:** `UNSAFE_componentWillMount` and similar, legacy string refs, legacy context, `findDOMNode`. Several of these were removed outright in React 19.

## Common questions

- **"My API is called twice in development!"** That's expected, and it's a hint: effect-based fetching needs cleanup (ignore stale results or abort), and duplicate requests are better handled by a cache (TanStack Query, framework loaders). Don't disable Strict Mode to "fix" it.
- **"Does it slow production?"** No. All checks are stripped from production builds.
- **"Can I use a ref to run an effect only once?"** That hides the symptom. Make the effect idempotent with proper cleanup. Truly once-per-app logic (analytics init) belongs at module level or behind a guard outside components.

## In an interview, mention…

- Development-only, no production cost, no UI.
- The double render catches impure renders. The double effect cycle catches missing cleanups.
- Why: concurrent rendering, and reusable or preserved state (Activity).
- React 19 additions: ref callback double-invoke and memo reuse. Don't disable it to hide double fetches. Fix the cleanup or use a cache.
