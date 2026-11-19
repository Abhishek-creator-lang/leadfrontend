## TL;DR

`useRef(initial)` returns a **mutable object `{ current }` that persists for the component's lifetime**. **Changing `.current` doesn't trigger a re-render.** Use it for two things: **referencing DOM nodes** (`<input ref={ref} />`) and **storing instance-like values that shouldn't affect rendering**, such as timer ids, previous values, latest callbacks, or flags. Don't read or write `ref.current` during render (except for lazy initialization). Treat refs as an escape hatch.

## DOM access

```jsx
function SearchBox() {
  const inputRef = useRef(null);
  return (
    <>
      <input ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
    </>
  );
}
```

React sets `ref.current` to the DOM node during commit and back to `null` when it unmounts. Use refs for focus, scrolling, measuring, media playback, and integrating non-React libraries.

**React 19 changes:**
- Function components receive `ref` as a **regular prop**, so `forwardRef` is no longer needed (it still works but is slated for deprecation).
- **Callback refs can return a cleanup function**, which React calls on detach instead of calling the ref with `null`.
- In TypeScript (`@types/react` 19), `useRef` requires an argument, and `RefObject.current` is mutable.

## Storing mutable values

```jsx
function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  const start = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  };
  const stop = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  useEffect(() => stop, []); // clear on unmount
  return <p>{elapsed}s <button onClick={start}>Start</button> <button onClick={stop}>Stop</button></p>;
}
```

The interval id is needed by event handlers but never displayed, so state would cause pointless renders.

## Ref vs state vs a module variable

| | `useState` | `useRef` | Module variable |
|---|---|---|---|
| Survives re-renders | Yes | Yes | Yes |
| Change triggers render | Yes | No | No |
| Per component instance | Yes | Yes | **No, shared by all instances** |
| Safe to read in render | Yes | No (generally) | Depends |

## Rules and pitfalls

- **Don't read or write `.current` during render.** It makes rendering impure and unpredictable in concurrent mode, and the React Compiler skips components that do it. The exception is lazy init: `if (ref.current === null) ref.current = createExpensive();`.
- **Don't use refs for anything shown in the UI.** The screen won't update when it changes.
- **Refs to child components.** You get whatever the child exposes. By default function components expose nothing unless they pass the ref to a DOM node. `useImperativeHandle` customizes it (e.g. only `focus()`).
- **Refs aren't in the dependency array meaningfully.** The ref object is stable, and changes to `.current` don't re-run effects. To react to a node mounting, use a callback ref.
- **`useRef(new Thing())`** constructs `Thing` on every render (and then discards it). Use the lazy pattern above.
- **Strict Mode** in React 19 also runs callback refs an extra time on mount in development (attach, detach, attach), so your ref cleanup logic has to be correct.

## In an interview, mention…

- A ref is a persistent box whose changes don't re-render.
- DOM access vs instance values, and why not to read refs during render.
- Callback refs for "node mounted" logic, and React 19's ref-as-prop and ref cleanups.
- `useImperativeHandle` to expose a minimal imperative API.
