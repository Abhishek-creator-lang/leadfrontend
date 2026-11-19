## TL;DR

The dependency array controls **when an effect re-synchronizes**. After each commit, React compares every dependency to its value from the previous render using **`Object.is`**. If any changed, it runs the **previous cleanup, then the effect again**. **No array** means the effect runs after every commit, **`[]`** means only on mount (cleanup on unmount), and **`[a, b]`** means on mount and whenever `a` or `b` changes. The array must list **every reactive value the effect reads** (props, state, and values derived from them). It's a correctness requirement, not an optimization knob.

## The three forms

```jsx
useEffect(() => { log('every commit'); });

useEffect(() => {
  const conn = connect();
  return () => conn.close();
}, []); // mount / unmount

useEffect(() => {
  const conn = connect(roomId);
  return () => conn.close();
}, [roomId]); // re-connects when roomId changes
```

Think of an effect as "keep this external system synchronized with these values", not as "run on mount". When `roomId` changes, React disconnects from the old room (cleanup) and connects to the new one.

In development with Strict Mode, every effect also runs **setup → cleanup → setup** once on mount, to verify that your cleanup works.

## What counts as a dependency

Any value from the component scope that can change between renders: props, state, context values, and variables or functions declared in the component body. Stable values can be omitted (setters from `useState`, `dispatch`, refs' `.current` container, module-level constants), though including them is harmless.

## Referential equality traps

```jsx
function Search({ query }) {
  const options = { query, limit: 10 }; // new object every render
  useEffect(() => {
    fetchResults(options);
  }, [options]); // runs after EVERY render
}
```

Fixes, in order of preference:

1. **Move the object or function inside the effect**, and depend on the primitives: `[query]`.
2. Hoist it outside the component if it doesn't depend on props or state.
3. `useMemo`/`useCallback` to keep its identity stable (the React Compiler can do this automatically).

## Don't lie to the linter

Omitting a dependency to "run it only once" creates **stale closures**:

```jsx
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000);
  return () => clearInterval(id);
}, []); // bug: count is always 0 inside
```

Fix it with an updater function (`setCount(c => c + 1)`). Or, if you need to read the latest value without re-running the effect, use **`useEffectEvent`** (stable since React 19.2) for the non-reactive part, or a ref.

## Pitfalls

- **Infinite loops.** An effect sets state that's also in its dependencies, or depends on an object recreated every render.
- **Race conditions.** When dependencies change quickly, old async work can resolve last. Use an `ignore` flag or `AbortController` in the cleanup.
- **Effects for derived data.** If the effect only computes something from props/state and sets state, delete it and compute during render.
- **Deep comparison** isn't supported. Depend on primitives or memoized values.

## In an interview, mention…

- `Object.is` comparison, cleanup-before-rerun, and the three forms.
- The dependency array describes what the effect reads. It isn't a scheduling tool, so follow `exhaustive-deps`.
- How to handle unstable objects/functions and stale closures (move inside, updater functions, `useEffectEvent`).
- Strict Mode's extra setup/cleanup cycle in development, and race-condition cleanup.
