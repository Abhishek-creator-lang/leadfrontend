## TL;DR

Every component that reads a context **re-renders whenever the provider's `value` changes by reference**, and there's no built-in way to subscribe to just part of it. To reduce re-renders: **memoize the provider value**, **split contexts by concern and update frequency**, **separate state from dispatch/actions** (stable functions in their own context), **keep providers low** in the tree, **pass stable `children`** so the provider's own re-render doesn't cascade, and for frequently changing or large state **use a store with selectors** (`useSyncExternalStore`, Zustand, Redux, Jotai), passing only the store instance through context.

## 1. Stable value

```jsx
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext value={value}>{children}</ThemeContext>; // React 19 syntax; .Provider in 18
}
```

Without `useMemo`, any re-render of `ThemeProvider` creates a new object and re-renders every consumer. (The React Compiler memoizes this automatically.)

## 2. Children as props

Because `children` is created by `ThemeProvider`'s *parent*, state changes inside `ThemeProvider` don't re-render the children unless they consume the context. Avoid rendering the app tree *inside* the provider component's own JSX.

## 3. Split by concern and frequency

```jsx
<UserContext value={user}>          {/* rarely changes */}
  <CartContext value={cart}>        {/* changes on add-to-cart */}
    <CursorContext value={cursor}>  {/* changes 60 times a second: probably not context at all */}
```

A theme toggle shouldn't re-render cart widgets.

## 4. Separate state and actions

```jsx
const TodosStateContext = createContext(null);
const TodosDispatchContext = createContext(null);

function TodosProvider({ children }) {
  const [todos, dispatch] = useReducer(reducer, []);
  return (
    <TodosDispatchContext value={dispatch}>   {/* dispatch is stable forever */}
      <TodosStateContext value={todos}>{children}</TodosStateContext>
    </TodosDispatchContext>
  );
}
```

An "Add todo" button that only dispatches never re-renders when the list changes.

## 5. Memoize the expensive part of consumers

Context changes bypass `memo` for the component that calls `useContext`, but you can split the consumer: a thin wrapper reads the context and passes the needed primitive to a `memo` child.

```jsx
function PriceTag() {
  const { currency } = useSettings();      // re-renders on any settings change
  return <MemoPrice currency={currency} />; // only re-renders when currency changes
}
```

## 6. Selectors via an external store

```jsx
const StoreContext = createContext(null); // value = store instance, never changes

function useStoreSelector(selector) {
  const store = useContext(StoreContext);
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
  );
}

const count = useStoreSelector(s => s.cart.items.length); // re-renders only when the count changes
```

The selector must return a stable value (a primitive or a memoized object), or you'll render in a loop. This is essentially what Zustand, Redux (`useSelector`) and `use-context-selector` do.

## 7. Defer, don't block

If the re-render is unavoidable but heavy, `useDeferredValue` or `startTransition` keeps input responsive while the expensive consumers update.

## Measure first

Use the React DevTools Profiler with "why did this render?" to confirm context is the culprit. Often a few re-renders are cheap and the real cost is elsewhere.

## In an interview, mention…

- Context has no selective subscription, so any value change re-renders all consumers.
- Memoized values, splitting, the state/dispatch split, and children-as-props.
- When to switch to `useSyncExternalStore`-based stores with selectors.
- The React Compiler removes the need for manual `useMemo` but not for splitting or selectors.
