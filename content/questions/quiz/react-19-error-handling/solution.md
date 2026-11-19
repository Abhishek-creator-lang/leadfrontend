## TL;DR

React 19 reworked error **reporting** rather than error **catching**. Error boundaries are still class components (`getDerivedStateFromError` + `componentDidCatch`), but now: **errors are no longer rethrown and logged twice**. Caught errors go to `console.error` once, and uncaught errors go to `window.reportError`. **`createRoot`/`hydrateRoot` accept three callbacks**: **`onCaughtError`** (a boundary caught it), **`onUncaughtError`** (nothing caught it, so the root unmounts), and **`onRecoverableError`** (React recovered automatically, e.g. a hydration mismatch). Errors thrown in **Actions** and transitions propagate to error boundaries, and hydration errors are reported as **one message with a diff**. Together these give you one consistent place to wire up monitoring.

## Root-level error callbacks

```jsx
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'), {
  onCaughtError(error, errorInfo) {
    // Boundary showed a fallback; report it as handled
    monitoring.captureException(error, {
      level: 'warning',
      extra: { componentStack: errorInfo.componentStack },
    });
  },
  onUncaughtError(error, errorInfo) {
    // App is gone; report as fatal and maybe show a static fallback outside React
    monitoring.captureException(error, {
      level: 'fatal',
      extra: { componentStack: errorInfo.componentStack },
    });
  },
  onRecoverableError(error, errorInfo) {
    // e.g. hydration mismatch that React fixed by client rendering
    monitoring.captureMessage(`Recoverable: ${error.message}`, {
      extra: { cause: error.cause, componentStack: errorInfo.componentStack },
    });
  },
});
root.render(<App />);
```

Before React 19 you had to combine `componentDidCatch` in every boundary, `window.onerror`, and console patching, and you got noisy duplicate logs because React rethrew caught errors in development.

## Where errors go now

| Error | Path |
|---|---|
| Render/lifecycle error inside a boundary | Boundary fallback, then `onCaughtError` (default: `console.error`) |
| Render error with no boundary | Root unmounts, then `onUncaughtError` (default: `reportError`) |
| Hydration mismatch, or an error React retried successfully | `onRecoverableError` |
| Error in an Action (`<form action>`, `useActionState`, async `startTransition`) | Nearest error boundary |
| Event handler / `setTimeout` / un-awaited promise | Not React's concern: `window` `error`/`unhandledrejection` |

## Error boundaries are still needed

```jsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary
  FallbackComponent={WidgetError}
  onReset={() => queryClient.resetQueries({ queryKey: ['revenue'] })}
  resetKeys={[dateRange]}
>
  <RevenueChart dateRange={dateRange} />
</ErrorBoundary>
```

There's still no hook-based boundary. Use a class or `react-error-boundary`. Place boundaries per route and per widget, and give fallbacks a recovery action.

## Expected vs unexpected errors with Actions

For **expected** failures (validation, "name taken"), **return** an error state from the action (`useActionState`) and render it inline. **Throw** only for unexpected failures you want a boundary to catch. That keeps boundaries for truly exceptional situations.

## Server-side

- Server rendering APIs (`renderToPipeableStream` and similar) have `onError`, which also lets you return a digest for the client.
- In Server Components, framework conventions (e.g. Next.js `error.js`) wrap segments in boundaries. Errors from the server are sanitized in production, and a digest links logs to the client report.

## In an interview, mention…

- The three root callbacks and what each one means.
- No more duplicate logging, and uncaught errors go through `reportError`.
- Action errors reach boundaries. Return expected errors as state.
- Boundaries are still class-only, so use `react-error-boundary` with resets and place them strategically.
