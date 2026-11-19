## TL;DR

In React 19, **function components receive `ref` as a regular prop**, so you no longer need `forwardRef` to pass a ref to an inner DOM node. `forwardRef` still works but is slated for deprecation, and a codemod exists. React 19 also lets **callback refs return a cleanup function**, called when the node is detached (instead of the callback being called with `null`). Related changes: `element.ref` access is deprecated (it's `element.props.ref` now), string refs were removed, `useRef` requires an argument in the TypeScript types, and Strict Mode double-invokes ref callbacks in development. **Class components** still treat `ref` specially: it refers to the instance and isn't passed as a prop.

## Ref as a prop

```jsx
// React 18
const Input = forwardRef(function Input({ label, ...props }, ref) {
  return <label>{label}<input ref={ref} {...props} /></label>;
});

// React 19
function Input({ label, ref, ...props }) {
  return <label>{label}<input ref={ref} {...props} /></label>;
}

function Form() {
  const inputRef = useRef(null);
  return <Input label="Email" ref={inputRef} />;
}
```

Benefits: less wrapping, better DevTools names (no `ForwardRef(Anonymous)`), simpler TypeScript types, and HOCs that spread `{...props}` forward refs automatically.

TypeScript:

```tsx
type InputProps = React.ComponentProps<'input'> & { label: string }; // includes ref in @types/react 19

function Input({ label, ref, ...props }: InputProps) {
  return <label>{label}<input ref={ref} {...props} /></label>;
}
```

## Ref callback cleanup

```jsx
function Video({ src }) {
  return (
    <video
      src={src}
      ref={node => {
        const observer = new IntersectionObserver(([entry]) => {
          entry.isIntersecting ? node.play() : node.pause();
        });
        observer.observe(node);
        return () => observer.disconnect(); // React 19: called on detach
      }}
    />
  );
}
```

Before 19, you'd stash the observer in a ref and handle the `node === null` call yourself. Note that returning anything other than a function from a ref callback is now treated as an error by TypeScript, which matters for implicit returns like `ref={n => (instance = n)}`. Use a block body.

**Inline callback refs** are recreated each render, so React detaches (runs cleanup) and re-attaches on every render. Keep the callback stable (`useCallback`, or hoist it) if setup is expensive.

## useImperativeHandle still applies

```jsx
function Dialog({ ref, children }) {
  const dialogRef = useRef(null);
  useImperativeHandle(ref, () => ({
    open: () => dialogRef.current.showModal(),
    close: () => dialogRef.current.close(),
  }), []);
  return <dialog ref={dialogRef}>{children}</dialog>;
}
```

The `ref` prop simply feeds into `useImperativeHandle` directly.

## Migration notes

- Run the codemod (`npx codemod@latest react/19/remove-forward-ref` or the react-codemod equivalent), and keep `forwardRef` in libraries that must support React 18.
- Libraries that clone elements and read `child.ref` need to read `child.props.ref` in 19.

## In an interview, mention…

- `ref` is a normal prop for function components, and `forwardRef` is being phased out.
- Ref callbacks can return a cleanup function. Watch for implicit returns and unstable inline callbacks.
- `useImperativeHandle` to expose a minimal API, and class components behave as before.
- Library compatibility: support both 18 and 19, and the `element.ref` deprecation.
