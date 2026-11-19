## TL;DR

For **DOM refs**, use `useRef<HTMLInputElement>(null)` and attach it with `ref={inputRef}`. The ref's `current` is `HTMLInputElement | null`, so **check for null** before using it (in effects or handlers). For **mutable instance values** (timer ids, previous values), use `useRef<number | null>(null)` or `useRef<T>(initial)`. With **`@types/react` 19**: `useRef` **requires an argument**, `RefObject.current` is **mutable** (`MutableRefObject` is deprecated), `ref` is a **regular prop** for function components (type it as `ref?: React.Ref<T>`, or get it via `ComponentProps<'input'>`), and **callback refs may return a cleanup function**. For imperative handles, type `useImperativeHandle` with an explicit handle interface.

## DOM refs

```tsx
function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus(); // current: HTMLInputElement | null
  }, []);

  return <input ref={inputRef} />;
}
```

Choose the **specific element type** (`HTMLButtonElement`, `HTMLDivElement`, `SVGSVGElement`, `HTMLCanvasElement`). JSX checks that the ref type matches the element.

## Mutable values

```tsx
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

function start() {
  timerRef.current = setTimeout(tick, 1000);
}
function stop() {
  if (timerRef.current) clearTimeout(timerRef.current);
  timerRef.current = null;
}
```

`ReturnType<typeof setTimeout>` works in both DOM (`number`) and Node (`Timeout`) typings.

**What changed in `@types/react` 19:**

- `useRef()` with no argument is an error. Write `useRef<T | undefined>(undefined)` or `useRef<T | null>(null)`.
- In React 18 types, `useRef<T>(null)` returned a **readonly** `RefObject<T>`, while `useRef<T | null>(null)` returned a `MutableRefObject`. That distinction confused many people. In 19, `RefObject<T>.current` is mutable and `MutableRefObject` is deprecated.

## Accepting a ref in your component

```tsx
// React 19: ref is a prop
type FancyInputProps = React.ComponentProps<'input'> & { label: string };

function FancyInput({ label, ref, ...props }: FancyInputProps) {
  return <label>{label}<input ref={ref} {...props} /></label>;
}

// Explicit form
type Props = { ref?: React.Ref<HTMLInputElement> };
```

React 18 (and libraries supporting it) use `forwardRef<HTMLInputElement, Props>((props, ref) => …)`. Note the generic order: element first, props second.

## Imperative handles

```tsx
export type DialogHandle = { open(): void; close(): void };

function Dialog({ ref, children }: { ref?: React.Ref<DialogHandle>; children: React.ReactNode }) {
  const el = useRef<HTMLDialogElement>(null);
  useImperativeHandle(ref, () => ({
    open: () => el.current?.showModal(),
    close: () => el.current?.close(),
  }), []);
  return <dialog ref={el}>{children}</dialog>;
}

// Parent
const dialogRef = useRef<DialogHandle>(null);
dialogRef.current?.open();
```

## Callback refs

```tsx
<div
  ref={(node: HTMLDivElement | null) => {
    if (!node) return;
    const ro = new ResizeObserver(() => setWidth(node.offsetWidth));
    ro.observe(node);
    return () => ro.disconnect(); // React 19 cleanup
  }}
/>
```

In 19's types, a callback ref may return `void` or a cleanup function, so implicit returns like `ref={n => (nodeRef.current = n)}` now error. Use a block body.

## Pitfalls

- Non-null assertions (`inputRef.current!.focus()`) in render or early effects. Prefer `?.` or guards.
- `React.Ref<T>` vs `RefObject<T>`: accept `Ref<T>` in props (it covers object refs, callback refs and null), and create `RefObject` with `useRef`.
- `LegacyRef` and string refs are gone in React 19.

## In an interview, mention…

- `useRef<HTMLElement>(null)` for DOM refs, null checks, and specific element types.
- `@types/react` 19 changes: argument required, mutable `RefObject`, ref as a prop.
- Typing `useImperativeHandle` with a handle type, and `React.Ref<T>` for props.
- Callback refs returning cleanup, and avoiding non-null assertions.
