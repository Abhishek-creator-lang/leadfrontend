## TL;DR

An error boundary is a component that **catches JavaScript errors thrown while rendering its children** (and in their lifecycle methods and constructors), **renders a fallback UI** instead of letting the whole app unmount, and can **log the error**. Since React 16, an uncaught render error unmounts the entire root, so boundaries are how you contain failures. They are still **class components only** (`static getDerivedStateFromError` + `componentDidCatch`). There's no hook, even in React 19, so most teams use `react-error-boundary`.

## Minimal boundary

```jsx
class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };                    // render phase: switch to fallback
  }

  componentDidCatch(error, info) {
    reportError(error, info.componentStack); // commit phase: side effects OK
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? <p role="alert">Something went wrong.</p>;
    }
    return this.props.children;
  }
}

<ErrorBoundary fallback={<WidgetError />}>
  <RevenueChart />
</ErrorBoundary>
```

## What they do NOT catch

- Errors in **event handlers** (use `try/catch`, then set state so the error shows in UI).
- **Async code**: `setTimeout`, promise callbacks, `fetch().then`, unless you rethrow it into render (e.g. `setState(() => { throw err; })`, or via `use(promise)`/Suspense data sources).
- **Server-side rendering** errors in the classic sense (frameworks handle these differently).
- Errors thrown **inside the boundary itself**. Those propagate to the next boundary up.

React 19 also lets errors thrown in **Actions** (`useActionState`, `<form action>`, `startTransition` with async functions) propagate to the nearest error boundary.

## Granularity

Place boundaries like bulkheads:

- **Root/route level:** a full-page "something went wrong" with a reload button.
- **Feature/widget level:** one broken dashboard card shouldn't take down the page.
- **Around third-party or risky components:** editors, charts, embedded content.

Too few means a small bug blanks the app. Too many means fragmented, inconsistent error UI.

## Recovery

Boundaries stay in the error state until reset. Common approaches:

- `react-error-boundary`'s `resetErrorBoundary` and `resetKeys` (reset when, say, the route or a query key changes).
- Change the boundary's `key` to remount it.
- Combine with your data library's retry (e.g. TanStack Query's `QueryErrorResetBoundary`).

## React 19 changes worth knowing

- Errors caught by a boundary are **reported once** (to `console.error`), instead of being rethrown and logged twice.
- `createRoot`/`hydrateRoot` take **`onCaughtError`** (caught by a boundary), **`onUncaughtError`** (not caught, so the app unmounts) and **`onRecoverableError`** (React recovered automatically, e.g. a hydration mismatch). This is the right place to wire up monitoring such as Sentry.
- In development, React still shows the error overlay even when a boundary catches it. That's expected.

## Pitfalls

- Expecting a boundary to catch a failed `fetch` in `useEffect`. It won't unless you surface the error during render.
- Fallbacks that themselves throw (for example by depending on the same broken data).
- Forgetting accessibility: give the fallback `role="alert"` and a clear recovery action.

## In an interview, mention…

- What they catch (render, lifecycle, constructors) and what they don't (handlers, async).
- They're still class-only, and teams usually use `react-error-boundary` with resets.
- Strategic placement by route and widget, plus logging.
- React 19's root error callbacks, de-duplicated logging, and Actions errors reaching boundaries.
