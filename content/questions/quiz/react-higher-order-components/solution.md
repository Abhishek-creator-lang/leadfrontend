## TL;DR

A higher-order component (HOC) is a **function that takes a component and returns a new, enhanced component**: `const Enhanced = withSomething(Component)`. It's a pattern built on composition, not a React API. HOCs were the main way to **reuse cross-cutting logic** (auth guards, data subscriptions, theming, analytics) before hooks, e.g. Redux's `connect` and React Router's old `withRouter`. Today **custom hooks are preferred** for sharing logic. HOCs still fit when you need to **wrap rendering**: guards, error or Suspense boundaries, layout, or instrumenting components you don't own.

## Example

```jsx
function withAuthGuard(Component, { redirectTo = '/login' } = {}) {
  function Guarded(props) {
    const { user, loading } = useAuth();
    if (loading) return <Spinner />;
    if (!user) return <Navigate to={redirectTo} replace />;
    return <Component {...props} user={user} />;
  }
  Guarded.displayName = `withAuthGuard(${Component.displayName || Component.name || 'Component'})`;
  return Guarded;
}

export default withAuthGuard(SettingsPage);
```

## Conventions

- **Pass through unrelated props** (`{...props}`) so the HOC is transparent.
- **Don't mutate the input component**. Wrap it.
- **Set `displayName`** for DevTools and error stacks.
- **Hoist non-React statics** if the wrapped component has static members (`hoist-non-react-statics`).
- **Forward refs.** Before React 19 that required `forwardRef`. In 19, `ref` is a normal prop and passes through with `{...props}`.
- **Create HOCs outside render.** `const X = withFoo(Y)` inside a component makes a new component type every render, which remounts the subtree and loses all state.

## Problems that pushed the ecosystem to hooks

- **Wrapper hell:** `withRouter(connect(...)(withTheme(withStyles(Component))))` creates deep trees in DevTools.
- **Implicit props:** it's unclear which HOC injected `user` or `theme`.
- **Prop collisions:** two HOCs injecting `data` silently overwrite each other.
- **Static typing:** inferring the props of composed HOCs in TypeScript is painful.

Hooks address all of these: `const user = useAuth()` is explicit, composable and typed.

## When HOCs are still reasonable

- **Wrapping with a boundary or provider:** `withErrorBoundary(Widget)` (`react-error-boundary` ships one), `withSuspense`.
- **Conditional rendering decisions** made before the component runs (guards, feature flags), so the wrapped component doesn't need to know.
- **Instrumentation:** profiling or analytics wrappers applied to many components, including third-party ones.
- **Library APIs** like `memo(Component)` and `lazy()`, which are HOC-shaped themselves.

## In an interview, mention…

- Definition: component in, component out. It's a composition pattern, not inheritance.
- Conventions: pass-through props, `displayName`, statics, refs, and never create them during render.
- Why hooks replaced most HOCs (implicit props, collisions, wrapper hell, typing).
- Legitimate modern uses: guards, boundaries, instrumentation.
