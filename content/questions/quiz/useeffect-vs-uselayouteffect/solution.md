## TL;DR

Both run after React commits DOM changes. The difference is **when relative to paint**. `useLayoutEffect` runs **synchronously after DOM mutations but before the browser paints**, so you can measure layout and update state without a visible flicker, at the cost of blocking paint. `useEffect` usually runs **after the browser has painted**, so it doesn't block the frame. **Default to `useEffect`.** Use `useLayoutEffect` only for measure-then-adjust work such as tooltips, positioning and scroll restoration.

## Timeline of a commit

1. Render: React calls your components (pure, can be interrupted in concurrent mode).
2. Commit: React applies DOM mutations and attaches refs.
3. **`useLayoutEffect` cleanups and setups run synchronously.** If they set state, React re-renders synchronously *before* paint.
4. The browser paints.
5. **`useEffect` cleanups and setups run** (deferred, typically after paint).

A nuance: if a commit was caused by a **discrete user input** (click, keydown), React 18 flushes passive effects synchronously before the next input, and if a layout effect triggers a re-render, pending passive effects are flushed first. So "after paint" is the norm, not an absolute guarantee. Never rely on `useEffect` for ordering against paint.

## Measuring without flicker

```jsx
function Tooltip({ anchorRect, children }) {
  const ref = useRef(null);
  const [top, setTop] = useState(0);

  useLayoutEffect(() => {
    const { height } = ref.current.getBoundingClientRect();
    // Flip above the anchor if there isn't room below
    const below = anchorRect.bottom + height < window.innerHeight;
    setTop(below ? anchorRect.bottom : anchorRect.top - height);
  }, [anchorRect]);

  return <div ref={ref} style={{ position: 'fixed', top }}>{children}</div>;
}
```

With `useEffect`, the user could briefly see the tooltip in the wrong place before it jumps. With `useLayoutEffect`, the first painted frame is already correct.

## Typical uses

| `useEffect` | `useLayoutEffect` |
|---|---|
| Data fetching, subscriptions, logging, analytics | Measuring DOM size/position, then setting state |
| Syncing with non-React widgets that don't affect layout | Scroll position restoration or anchoring |
| Timers | Avoiding visual flicker on the first paint |

(`useInsertionEffect` is a third variant that runs before layout effects. It is meant only for CSS-in-JS libraries injecting `<style>` tags.)

## Pitfalls

- **Performance.** Layout effects block paint. Heavy work there hurts responsiveness (INP/LCP).
- **SSR.** Neither runs on the server. In React 18 and earlier, `useLayoutEffect` printed a warning during SSR, and the usual workaround was an "isomorphic layout effect" (`typeof window !== 'undefined' ? useLayoutEffect : useEffect`). React 19 removed that warning, but the effect still only runs after hydration, so the server HTML can't use measured values.
- **Strict Mode.** In development both run setup → cleanup → setup on mount, so cleanups must be correct.
- **Neither is for derived state.** If you can compute a value during render, do that.

## In an interview, mention…

- The order: render, commit (DOM mutated), layout effects, paint, passive effects.
- Use `useLayoutEffect` to prevent flicker when you measure and then mutate. Otherwise use `useEffect`.
- The cost: it blocks paint. Also mention the SSR behaviour and `useInsertionEffect` for CSS-in-JS.
- The flush nuance for discrete events, and why you shouldn't depend on exact effect timing.
