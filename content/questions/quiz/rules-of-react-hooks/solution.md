## TL;DR

There are two rules. **1) Only call hooks at the top level** of a component or custom hook, never inside conditions, loops, nested functions, `try/catch`, or after an early `return`. **2) Only call hooks from React function components or custom hooks**, never from plain functions, class components or event handlers. They exist because **React identifies each hook by its call order**. The `eslint-plugin-react-hooks` rules `rules-of-hooks` and `exhaustive-deps` enforce them (and, in newer versions, the broader Compiler-based "rules of React"). React 19's `use` is the one exception that may be called conditionally.

## Why call order matters

React doesn't know hook names. For each component instance it keeps a **linked list of hook slots** on the fiber. On every render, the 1st `useState` call gets slot 1, the 2nd gets slot 2, and so on.

```jsx
function Profile({ user }) {
  const [name, setName] = useState(user.name);   // slot 1
  if (!user.isAdmin) return <p>{name}</p>;        // early return
  const [perms, setPerms] = useState([]);         // slot 2, only sometimes!
  useEffect(() => { /* ... */ }, []);             // slot 2 or 3
  // ...
}
```

When `isAdmin` flips, the slots shift and React hands `perms` the state of a different hook, or throws "Rendered more hooks than during the previous render". Fix it by calling all hooks first and branching afterwards:

```jsx
function Profile({ user }) {
  const [name, setName] = useState(user.name);
  const [perms, setPerms] = useState([]);
  useEffect(() => { /* ... */ }, []);
  if (!user.isAdmin) return <p>{name}</p>;
  // ...
}
```

Or move the conditional part into a child component that is rendered conditionally.

## Rule 2: only from React functions

Hooks need a currently rendering component to attach to. Calling `useState` in a utility function invoked from an event handler has no fiber, so it throws. Custom hooks must start with `use` so the linter (and the Compiler) can recognize them and apply the same rules inside.

## Lint enforcement

```js
// eslint.config.js (flat config)
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  reactHooks.configs.recommended, // the exact export name depends on the plugin version
];
```

- `react-hooks/rules-of-hooks` (error) catches conditional, looped or misplaced calls.
- `react-hooks/exhaustive-deps` (warn) flags missing or unnecessary dependencies in `useEffect`, `useMemo` and `useCallback`. Treat its warnings as bugs, not noise. If a dependency "must" be omitted, restructure (updater functions, refs, moving logic into the effect, or `useEffectEvent`, which is stable since React 19.2).
- Recent versions of the plugin also bundle Compiler-powered diagnostics (purity, refs during render, setState in render…) that report code the React Compiler would have to skip.

## Related "rules of React"

Beyond the two hook rules, react.dev documents that components and hooks must be **pure during render** (same inputs give the same output, no side effects), **props and state are immutable**, and **hook arguments and return values are immutable**. Strict Mode's double rendering and the Compiler both rely on this.

## Exceptions and nuances

- `use(promise | context)` (React 19) **may** be called inside conditions and loops, but still only in components/hooks and not in `try/catch`.
- Hooks can't be called conditionally, but the *component* that calls them can be rendered conditionally.

## In an interview, mention…

- The two rules, and that the reason is order-based hook identity.
- How to fix a conditional hook (hoist it or split the component).
- The ESLint plugin, `exhaustive-deps`, and why suppressing it is a smell.
- `use` is the exception, and the broader purity rules the Compiler depends on.
