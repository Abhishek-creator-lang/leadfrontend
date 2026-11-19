## TL;DR

**Re-rendering means React calls your component function again** to get a new element tree. It then **reconciles** that tree with the previous one and **commits only the DOM changes that are actually needed**. A re-render is not the same as a DOM update: many re-renders produce identical output and touch nothing. A component re-renders when **its state changes, its parent re-renders, or a context it consumes changes**. Props changing is not a trigger by itself. The parent re-rendering is.

## The three phases

1. **Trigger:** initial `root.render()`, a state setter, a context value change, or (for the initial mount) hydration.
2. **Render:** React calls the components that need updating (and, by default, all their descendants) to compute new elements. This must be **pure**. In concurrent mode it can be paused, restarted or thrown away.
3. **Commit:** React applies the minimal set of DOM mutations, runs layout effects, lets the browser paint, then runs passive effects.

## What triggers a re-render

```jsx
function Parent() {
  const [n, setN] = useState(0);
  return (
    <>
      <button onClick={() => setN(n + 1)}>+</button>
      <Child />            {/* re-renders on every click, even with no props */}
      <Display value={n} />
    </>
  );
}
```

- **State change** in the component itself. Setting the same value (`Object.is`) usually bails out.
- **Parent re-render.** By default React re-renders the whole subtree beneath the component that changed. `Child` re-renders even though nothing it uses changed.
- **Context change** for components that read that context.
- **Not** a mutated object, a ref change, or a change to a variable outside React.

## Is re-rendering bad?

Usually no. Rendering is a JS function call plus a diff, and React is designed for it. It becomes a problem when:

- The subtree is large (big lists, tables, charts).
- Render does expensive work (sorting or formatting large data).
- It happens at high frequency (typing, dragging, scroll handlers, animation).

## Reducing unnecessary re-renders

1. **Move state down** to the component that actually uses it.
2. **Lift content up and pass it as `children`.** Elements created by the parent keep the same identity when the wrapper's own state changes, so React skips them.

```jsx
function HoverCard({ children }) {
  const [hover, setHover] = useState(false);
  return <div onMouseEnter={() => setHover(true)}>{children}</div>; // children don't re-render
}
```

3. **`memo(Component)`** to skip re-rendering when props are shallow-equal, plus `useMemo`/`useCallback` for stable props. The **React Compiler** applies this automatically.
4. **Split contexts** or use selector-based stores.
5. **`useTransition`/`useDeferredValue`** to make expensive re-renders non-blocking.
6. **Virtualize** long lists.

## Pitfalls

- Optimizing without measuring. Use the DevTools Profiler and "Highlight updates when components render".
- Inline objects and functions as props to memoized children defeat `memo`.
- Assuming a re-render means a DOM update.
- In development, **Strict Mode renders twice**, so render counts in logs are doubled.

## In an interview, mention…

- Render (call components) vs commit (touch the DOM) and the three triggers.
- Parent re-renders cascade to children by default, and that props changing isn't itself a trigger.
- Structural fixes first (state colocation, `children`), then memoization or the Compiler.
- Measure with the Profiler, and remember that Strict Mode double-renders in development.
