---
title: Hooks in depth
description: How each built-in hook really works, the common mistakes interviewers probe, and when not to use effects, covering React 18 and 19.
source: original
---
Hooks are the center of most React interviews. Knowing the API isn't enough. Interviewers want to know *why* hooks behave the way they do, and whether you can avoid the classic traps: stale closures, effect misuse, and pointless memoization.

## Why the Rules of Hooks exist

1. Call hooks only at the **top level** of a component or custom hook. Never inside conditions, loops, or nested functions.
2. Call hooks only from **React function components or custom hooks**.

React stores hook state in a list attached to the component instance and matches each hook call to its slot **by call order**. If a hook is called conditionally, the order shifts and React reads the wrong state. The `eslint-plugin-react-hooks` rules enforce this. Treat its warnings as errors.

(The React 19 `use` API is the exception: it can be called conditionally, because it doesn't store state by position in the same way.)

## Hook reference

| Hook | Purpose | Version |
| --- | --- | --- |
| `useState` | Local state | 16.8 |
| `useReducer` | State with complex transitions | 16.8 |
| `useEffect` | Synchronize with external systems after commit | 16.8 |
| `useLayoutEffect` | Measure or mutate the DOM before paint | 16.8 |
| `useRef` | Mutable value that doesn't trigger a render; DOM refs | 16.8 |
| `useMemo` / `useCallback` | Cache a value or function between renders | 16.8 |
| `useContext` | Read context | 16.8 |
| `useImperativeHandle` | Customize the ref exposed to a parent | 16.8 |
| `useId` | Stable unique ids that match between SSR and client | 18 |
| `useTransition` / `useDeferredValue` | Non-urgent updates | 18 |
| `useSyncExternalStore` | Subscribe to external stores safely under concurrency | 18 |
| `useInsertionEffect` | Inject styles before layout effects (CSS-in-JS libraries) | 18 |
| `use` | Read a promise or context during render (can be conditional) | 19 |
| `useActionState` | State driven by an async action (forms) | 19 |
| `useOptimistic` | Optimistic UI while an action is pending | 19 |
| `useFormStatus` (react-dom) | Pending state of the parent `<form>` | 19 |
| `useEffectEvent` | Read latest values in effects without re-subscribing | 19.2 |

## useState

```jsx
const [items, setItems] = useState(() => loadFromStorage()); // lazy initializer runs once
setItems((prev) => [...prev, newItem]); // functional update, never mutate
```

- Updates are **asynchronous snapshots**. The variable doesn't change until the next render.
- Setting the same value (`Object.is`) bails out of the re-render.
- Use a lazy initializer for expensive initial values. `useState(load())` calls `load()` on every render.
- Group state that changes together. Avoid state that duplicates props or can be derived.

## useReducer

Prefer it when the next state depends on several fields, or when transitions have names:

```tsx
type State = { status: 'idle' | 'loading' | 'success' | 'error'; data?: Item[]; error?: string };
type Action =
  | { type: 'fetch' }
  | { type: 'resolve'; data: Item[] }
  | { type: 'reject'; error: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'fetch': return { status: 'loading', data: state.data };
    case 'resolve': return { status: 'success', data: action.data };
    case 'reject': return { status: 'error', error: action.error, data: state.data };
  }
}
```

The discriminated union makes impossible states impossible, which is a strong signal in interviews. `dispatch` is stable across renders, so it's safe to pass down or put in context.

## useEffect

Effects are for **synchronizing with external systems**: subscriptions, timers, network requests not handled by a data library, imperative widgets, and analytics on display.

```jsx
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/users/${id}`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setUser)
    .catch((e) => { if (e.name !== 'AbortError') setError(e); });
  return () => controller.abort(); // cleanup prevents race conditions
}, [id]);
```

**Dependencies:** list every reactive value (props, state, and values derived from them) used inside the effect. Don't lie to the linter. If a dependency changes too often, restructure: move the object inside the effect, use a functional update, or extract an effect event.

**Cleanup** runs before the effect re-runs and on unmount. In development Strict Mode, effects mount, clean up, and mount again to surface missing cleanups.

### You might not need an effect

| Instead of an effect that… | Do this |
| --- | --- |
| Computes derived data from props/state | Calculate during render (`useMemo` if expensive) |
| Resets state when a prop changes | Pass a `key` |
| Adjusts some state when a prop changes | Compute it during render, or store the previous prop and compare |
| Responds to a user event (submit, click) | Do it in the event handler |
| Notifies the parent of a state change | Call the parent's callback in the same event handler |
| Fetches data | Use a framework loader, a data library, or `use` with a cached promise |
| Subscribes to an external store | `useSyncExternalStore` |

Unnecessary effects cause extra renders, flashes of incorrect UI, and bugs from out-of-sync state.

## useLayoutEffect

Runs synchronously after DOM mutations and before paint. Use it for measurements that affect layout (tooltip positioning) to avoid flicker. It blocks paint, so keep it short. It doesn't run on the server, so you'll need a fallback or a client-only render path for SSR.

## useRef

```jsx
const inputRef = useRef(null);
const intervalId = useRef(null);

function start() {
  intervalId.current = setInterval(tick, 1000); // write refs in handlers/effects
}
function stop() {
  clearInterval(intervalId.current);
}
```

- `ref.current` changes don't trigger renders.
- Don't read or write refs during render (except lazy initialization). It makes render impure.
- **React 19:** function components receive `ref` as a regular prop, so `forwardRef` is no longer needed for new code (it still works). Ref callbacks can return a cleanup function.

```jsx
// React 19
function TextInput({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

## useMemo and useCallback

`useMemo(fn, deps)` caches a computed value. `useCallback(fn, deps)` caches a function (it's `useMemo(() => fn, deps)`).

Use them when:
1. The computation is measurably expensive (filtering or sorting thousands of items).
2. The value or function is passed to a `memo`-wrapped child or used as an effect dependency, and identity stability matters.

Don't use them for cheap computations or values only used locally. Memoization has costs (memory, comparisons, code noise).

**React Compiler** (stable since 2025) memoizes components and hooks automatically at build time. In compiled codebases, manual memoization is rarely needed. Interviewers like hearing that you know this, but you should still understand the manual tools.

## useContext

Every component that reads a context re-renders when the provider value changes (by `Object.is`). Common optimizations:

- Memoize the provider value: `useMemo(() => ({ user, login }), [user, login])`.
- Split contexts by update frequency (state context vs dispatch context).
- For high-frequency updates, use an external store with selectors instead of context.

**React 19:** you can render `<ThemeContext value={...}>` directly as the provider; `<ThemeContext.Provider>` still works but will be deprecated later. `use(ThemeContext)` reads context and can be called conditionally.

## useTransition and useDeferredValue

```jsx
const [isPending, startTransition] = useTransition();
function selectTab(next) {
  startTransition(() => setTab(next)); // urgent input stays responsive
}
```

- `useTransition` wraps the *state update* you control.
- `useDeferredValue` defers a *value* you receive (e.g. a prop or input text).
- React 19: `startTransition` accepts async functions (**Actions**). `isPending` stays true until the async work finishes.

## useSyncExternalStore

```js
function useOnlineStatus() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('online', cb);
      window.addEventListener('offline', cb);
      return () => {
        window.removeEventListener('online', cb);
        window.removeEventListener('offline', cb);
      };
    },
    () => navigator.onLine,   // client snapshot
    () => true                // server snapshot
  );
}
```

This prevents "tearing" (different components seeing different store values in one concurrent render). Store libraries use it under the hood.

## useEffectEvent (React 19.2)

Solves "I need the latest value inside an effect, but it shouldn't re-trigger the effect":

```jsx
const onConnected = useEffectEvent(() => showToast(`Connected to ${roomId}`, theme));
useEffect(() => {
  const conn = connect(roomId);
  conn.on('connected', onConnected);
  return () => conn.disconnect();
}, [roomId]); // theme changes don't reconnect
```

Effect events must only be called from inside effects. Before 19.2, people used a "latest ref" pattern.

## Custom hooks

Custom hooks share **logic**, not state. Each call gets its own state.

```tsx
function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
```

Good custom hooks have a narrow purpose, a clear name, and return a stable, typed API. Avoid "god hooks" that return twenty values.

## Classic traps and fixes

| Trap | Symptom | Fix |
| --- | --- | --- |
| Stale closure in interval | Counter stuck at 1 | Functional update or correct deps |
| Object/array dependency | Effect runs every render | Move creation inside the effect, or memoize |
| Missing cleanup | Duplicate listeners, memory leaks, double fetch in Strict Mode | Return cleanup |
| Fetch race condition | Old response overwrites new | `AbortController` or an `ignore` flag |
| Setting state during render unconditionally | Infinite loop | Compute instead, or guard the condition |
| Async function as effect | Effect returns a promise | Define an async function inside and call it |
