## TL;DR

`useMemo(() => compute(a, b), [a, b])` **caches the result of a calculation between renders** and recomputes only when a dependency changes (`Object.is`). Use it for **genuinely expensive computations** (filtering or sorting thousands of rows, heavy parsing) and to **keep object/array identities stable** for memoized children or hook dependencies. It's a performance hint, not a semantic guarantee: React may discard the cache, and in development Strict Mode calls your function twice. With the **React Compiler**, most manual `useMemo` calls are unnecessary.

## Expensive computation

```jsx
function ProductTable({ products, query, sortKey }) {
  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return products
      .filter(p => p.name.toLowerCase().includes(q))
      .sort((a, b) => compare(a[sortKey], b[sortKey]));
  }, [products, query, sortKey]);

  const [hovered, setHovered] = useState(null);
  // Hovering re-renders, but `visible` is reused
  return <Table rows={visible} onHover={setHovered} />;
}
```

How do you know it's expensive? Measure it (`console.time`, or the React Profiler). A rough rule from react.dev: if it consistently takes around **1 ms or more** on a slow device, memoizing is reasonable.

## Referential stability

```jsx
const chartOptions = useMemo(() => ({ theme, showLegend: true }), [theme]);
return <MemoChart options={chartOptions} />; // memo(Chart)
```

Without `useMemo`, a new object each render defeats `memo` and re-runs any effect that depends on `options`.

## Things it isn't

- **Not a guarantee.** Your code should still be correct if React recomputes. Don't use `useMemo` to "run something once" or for side effects. Use a ref, state initializer or effect instead.
- **Not free.** It stores values and compares dependencies on each render, and it makes code harder to read.
- **Not a fix for slow child renders** on its own. Pair it with `memo` on the child, or restructure (move state down, pass `children`).

## Alternatives before reaching for useMemo

1. **Move state down** so the expensive part isn't re-rendered by unrelated state.
2. **Lift content up as `children`.** Elements created by the parent don't re-render when the wrapper's state changes.
3. **Lazy initial state** for one-time computations: `useState(() => parse(raw))`.
4. **`useDeferredValue`** when the cost is unavoidable but shouldn't block typing.
5. Virtualize long lists rather than memoizing a list of 10,000 rendered rows.

## React 19 and the Compiler

- Keep the calculation pure, because Strict Mode exercises it extra times in development. React 19 changed the Strict Mode double render so that `useMemo`/`useCallback` reuse the memoized result from the first render during the second.
- The React Compiler auto-memoizes computations and JSX based on its own dependency analysis, often more precisely than hand-written dependency arrays. On a compiled codebase, reserve manual `useMemo` for cases the compiler can't handle or where you need explicit control over effect dependencies.

## In an interview, mention…

- Two use cases: expensive calculations and stable identities.
- Measure before memoizing, and it's a hint, not a semantic guarantee.
- Structural fixes (state colocation, children as props, deferring) often beat memoization.
- The React Compiler is making manual memoization mostly obsolete.
