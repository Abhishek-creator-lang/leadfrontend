## TL;DR

Context solves prop drilling, but it is **a dependency-injection mechanism, not a state manager**. The main pitfalls are: **every consumer re-renders when the provider's `value` changes by reference** (and you can't subscribe to just part of it), creating a **new value object on every render**, putting **fast-changing or unrelated state into one big context**, **hidden coupling** that makes components hard to reuse and test, and **forgetting the provider** (you silently get the default value).

## 1. New value every render

```jsx
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // A new object on each render, so every consumer re-renders whenever AuthProvider does
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

Fix: memoize the value, or let the React Compiler do it.

```jsx
const value = useMemo(() => ({ user, setUser }), [user]);
```

(React 19 also lets you write `<AuthContext value={…}>` directly. `.Provider` still works.)

## 2. No selective subscription

`useContext` re-renders the consumer whenever the value changes, **even if the component reads a field that didn't change**. A context holding `{ theme, user, cart }` re-renders theme-only components on every cart update. `React.memo` on the consumer doesn't help, because context bypasses props.

Mitigations:

- **Split contexts** by concern and change frequency (`ThemeContext`, `UserContext`, `CartContext`).
- **Separate state from dispatch.** Put `dispatch` (which is stable) in its own context so "write-only" components never re-render.
- For high-frequency or large shared state, use an **external store with selectors** (Zustand, Redux, Jotai, or `useSyncExternalStore`). Context can still pass the store instance, which never changes.

## 3. Using context for everything

Context makes data implicitly global within a subtree. Overuse leads to:

- Components that only work inside a specific provider stack (hard to reuse, and stories and tests need wrapper providers).
- Unclear data flow, because "where does this value come from?" means searching up the tree.
- Often a better answer is **composition**: pass `children` or element props so intermediate layers don't need the data at all.

## 4. Missing provider / default values

```jsx
const ThemeContext = createContext('light');
```

If a consumer renders outside the provider it silently gets `'light'`. For required contexts, default to `null` and throw in a custom hook:

```jsx
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
```

## 5. Other gotchas

- The **nearest provider wins**. Nested providers can shadow each other unexpectedly.
- Provider **placement matters**. Putting it high in the tree means a state change re-renders the provider's component. Its `children` don't re-render unless they consume the context, which is a useful optimization.
- **Server Components can't consume context.** Providers must be Client Components, so wrap them in a `'use client'` file and render them as close to the leaves as practical.
- In React 19, `use(Context)` can be called conditionally, unlike `useContext`.

## In an interview, mention…

- Context propagates a value. It isn't optimized for frequently changing global state.
- Reference stability of `value`, splitting contexts, and state/dispatch separation.
- When to switch to a selector-based store, and composition as an alternative to context.
- Custom hooks that throw without a provider, plus the RSC limitation.
