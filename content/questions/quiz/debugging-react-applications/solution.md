## TL;DR

Combine **React DevTools** (Components tab to inspect props, state, hooks and context and see which component rendered something; **Profiler** to find what rendered, why, and how long it took), **browser DevTools** (breakpoints, `debugger`, network, performance traces), **Strict Mode** (surfaces impure renders and missing effect cleanups in development), **ESLint's hooks rules** (catch stale closures before runtime), and **error monitoring** (error boundaries plus `onCaughtError`/`onUncaughtError` reporting to a tool like Sentry with source maps). Reproduce, isolate, inspect, then fix and add a test.

## A practical workflow

1. **Reproduce reliably.** Note the exact steps and data. Check whether it happens in a production build as well as development. Strict Mode and dev-only warnings can change behaviour.
2. **Read the console.** React's development warnings are specific: key warnings, controlled/uncontrolled switches, hydration diffs (much more detailed in React 19), invalid DOM nesting, and `act` warnings in tests.
3. **Inspect with React DevTools.**
   - Select a component to see its props, state, hooks (in order) and the context values it receives. Edit them live to test hypotheses.
   - "Rendered by" shows the owner chain. Use "view source" to jump to code.
   - Use `$r` in the console to reference the selected component.
4. **Profile performance.** The Profiler's flamegraph shows each commit. Enable "Record why each component rendered" to see "props changed: onClick" style answers. "Highlight updates when components render" visualizes cascades.
5. **Step through code.** Set breakpoints in Sources, or drop a `debugger;` into an event handler or effect. Conditional breakpoints help in hot render paths.
6. **Check the network and data.** Use the Network tab, your data library's devtools (TanStack Query, Redux DevTools with time travel), and MSW to reproduce server edge cases.
7. **Narrow it down.** Comment out subtrees, reduce to a minimal reproduction, or `git bisect` a regression.

## Common bug classes and how to spot them

| Symptom | Likely cause | Tooling |
|---|---|---|
| Value "lags one step behind" | Reading state right after setting it (snapshot) | Breakpoint, log in render |
| Effect uses an old value | Stale closure, missing dependency | `exhaustive-deps` lint |
| Effect runs in a loop | Object/function dependency recreated every render | Profiler "why rendered", log dependencies |
| Runs twice in development | Strict Mode double invocation (expected) | Check whether cleanup is correct |
| State lands on the wrong list row | Index or unstable keys | DevTools key column |
| Hydration error | Server/client render differ | React 19 diff in console |
| Slow typing | Expensive re-render on each keystroke | Profiler, `useDeferredValue` |

```jsx
useEffect(() => {
  console.log('effect deps', { userId, filters }); // compare identities across runs
}, [userId, filters]);
```

## Production debugging

- Ship **source maps** to your error tracker (not necessarily publicly).
- Report errors with the **component stack**: `componentDidCatch(error, info)` gives `info.componentStack`, and React 19's root `onCaughtError`/`onUncaughtError` callbacks receive it too.
- Add breadcrumbs (route changes, key actions) and session replay where privacy rules allow.
- Use a **profiling build** of React (`react-dom/profiling`) to profile in production-like conditions.

## Pitfalls

- Leaving `console.log` in render and misreading the doubled output from Strict Mode.
- "Fixing" lint warnings by removing dependencies instead of fixing the closure.
- Profiling in development mode: it's much slower and not representative of production timings.

## In an interview, mention…

- DevTools Components and Profiler, especially "why did this render".
- Strict Mode and lint rules as prevention, not just tools for diagnosis.
- Production observability: boundaries, root error callbacks, source maps.
- A systematic process: reproduce, isolate, fix, then add a regression test.
