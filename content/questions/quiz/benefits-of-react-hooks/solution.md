## TL;DR

Hooks (React 16.8+) let function components **hold state, run effects and access React features** without classes. Their big win is **reusing stateful logic through custom hooks** (no more HOC and render-prop "wrapper hell"). They also **co-locate related logic** that classes spread across lifecycle methods, avoid `this` binding confusion, and produce code that is easier to compose, minify and optimize. That includes the React Compiler, which only works on function components and hooks.

## What hooks replaced

Before hooks, sharing behaviour such as "subscribe to window size" required:

- **HOCs**: `withWindowSize(withRouter(withTheme(Component)))`. Wrapper nesting, prop-name collisions, and unclear origin of props.
- **Render props**: `<WindowSize>{size => …}</WindowSize>`. Nested callback pyramids.
- **Classes**: logic split across `componentDidMount`, `componentDidUpdate` and `componentWillUnmount`, with unrelated concerns mixed in the same method.

## The same logic with a custom hook

```jsx
function useWindowWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
}

function Sidebar() {
  const width = useWindowWidth();
  return width > 900 ? <FullNav /> : <CompactNav />;
}
```

Setup and cleanup sit together. The hook is a plain function you can test, compose and share, and it adds no wrapper components to the tree.

## Benefits

- **Logic reuse without changing the tree.** Each call to a custom hook gets **its own independent state**. Hooks share logic, not state.
- **Co-location by concern.** One `useEffect` per side effect, rather than one lifecycle method holding many concerns.
- **No `this`.** No binding handlers or `this.state` vs `this.props` mix-ups.
- **Composition.** Hooks call other hooks, so you build `useAuth` from `useContext` + `useSyncExternalStore` + `useEffect`.
- **Better tooling.** Lint rules (`eslint-plugin-react-hooks`) catch missing dependencies and rule violations, functions minify better than classes, and types are simpler.
- **Unlocks new React features.** Concurrent features (`useTransition`, `useDeferredValue`), `useId`, `useSyncExternalStore`, React 19's `use`, `useActionState`, `useOptimistic`, and the React Compiler are all hooks-first.

## Costs and pitfalls

- **Rules of hooks.** Calls must happen in the same order every render (top level only).
- **Closures and stale values.** Every render captures its own props/state, so missing dependencies cause stale data and extra dependencies cause effect loops.
- **Effects are overused.** Many effects should be derived values computed during render or event-handler logic ("You Might Not Need an Effect").
- **Some things are still class-only.** Error boundaries (`componentDidCatch`/`getDerivedStateFromError`) don't have a hook equivalent, even in React 19.

## In an interview, mention…

- The core benefit is reusable stateful logic via custom hooks, which replaced HOCs and render props for most cases.
- Co-locating setup and cleanup by concern.
- The trade-offs: closures, dependency arrays, and effect overuse.
- Modern React APIs and the Compiler assume function components and hooks. Error boundaries are the main class-only holdout.
