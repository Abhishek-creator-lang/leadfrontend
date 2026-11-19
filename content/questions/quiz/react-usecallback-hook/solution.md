## TL;DR

`useCallback(fn, deps)` returns the **same function identity across renders until a dependency changes**. On its own it makes nothing faster. Creating functions is cheap. It's useful when **function identity matters**: passing a callback to a `React.memo` child, using a function as a dependency of another hook (`useEffect`, `useMemo`), or returning functions from custom hooks. With the **React Compiler** (stable since late 2025), most manual `useCallback` calls become unnecessary because the compiler memoizes automatically.

## What it does

```jsx
const handleSelect = useCallback(id => {
  setSelected(id);
  onChange?.(id);
}, [onChange]);
```

That's equivalent to `useMemo(() => fn, deps)`. React stores the function from the first render and keeps returning it while `onChange` stays the same (`Object.is`). The function you write is still *created* each render. React just ignores the new one.

## When it actually helps

**1. Memoized children**

```jsx
const Row = memo(function Row({ item, onSelect }) {
  return <li onClick={() => onSelect(item.id)}>{item.name}</li>;
});

function List({ items }) {
  const [selected, setSelected] = useState(null);
  const onSelect = useCallback(id => setSelected(id), []);
  return <ul>{items.map(i => <Row key={i.id} item={i} onSelect={onSelect} />)}</ul>;
}
```

Without `useCallback`, `onSelect` is new every render, so `memo` sees a changed prop and every `Row` re-renders.

**2. Effect dependencies**

```jsx
const fetchUser = useCallback(() => api.get(`/users/${id}`), [id]);
useEffect(() => { fetchUser().then(setUser); }, [fetchUser]);
```

Often it's simpler to define the function **inside** the effect and depend on `id` directly.

**3. Custom hooks' public API**

Consumers may put your returned functions in their own dependency arrays, so stable identities make a hook easier to use.

## When it's pointless

- Passing the callback to a plain DOM element (`<button onClick={…}>`), or to a non-memoized child. The child re-renders anyway.
- Dependencies that change every render (an inline object or another unmemoized function). The cache is never hit.
- Wrapping every handler "just in case". It adds noise and comparison cost.

## Tips

- **Reduce dependencies with updater functions:** `setItems(prev => [...prev, x])` doesn't need `items` in the dependencies.
- **Need the latest props without changing identity?** `useEffectEvent` (stable in React 19.2) is designed for effect logic. For general callbacks, a ref holding the latest function is the classic pattern.
- **Measure first.** Use the React DevTools Profiler to confirm a re-render is actually expensive.

## React Compiler

The compiler analyzes components and hooks at build time and memoizes values, callbacks and JSX at a finer grain than you'd do by hand. In compiled code, `useCallback`/`useMemo` are usually redundant, though keeping them is harmless. They remain useful as an explicit tool in code the compiler skips, or when you need a guaranteed stable identity for an effect dependency.

## In an interview, mention…

- It caches a function identity. It doesn't make functions cheaper to create.
- It only pays off with `memo` children, hook dependencies, or library APIs.
- Alternatives: move functions into effects, updater functions, `useEffectEvent`.
- The React Compiler is shifting manual memoization from the default to the exception.
