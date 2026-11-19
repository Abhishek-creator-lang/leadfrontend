## TL;DR

`forwardRef` lets a function component **receive a `ref` from its parent and pass it on** to a DOM node or another component. Before React 19, `ref` wasn't a normal prop: React stripped it out, so `<FancyInput ref={r} />` didn't reach the component unless it was wrapped in `forwardRef`. **In React 19, function components receive `ref` as a regular prop**, so `forwardRef` is no longer needed for new code. It still works, and React plans to deprecate it in a future release.

## Pre-19 pattern

```jsx
import { forwardRef, useRef } from 'react';

const TextInput = forwardRef(function TextInput({ label, ...props }, ref) {
  return (
    <label>
      {label}
      <input ref={ref} {...props} />
    </label>
  );
});

function Form() {
  const inputRef = useRef(null);
  return (
    <>
      <TextInput label="Email" ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Focus email</button>
    </>
  );
}
```

`forwardRef` passes `ref` as a **second argument** to the render function.

## React 19

```jsx
function TextInput({ label, ref, ...props }) {
  return (
    <label>
      {label}
      <input ref={ref} {...props} />
    </label>
  );
}
```

`ref` is just a prop now. A codemod can migrate `forwardRef` usage. (Class components still treat `ref` specially: it points to the instance.)

## Why you'd forward a ref at all

- **Design-system primitives** (`Button`, `Input`, `Link`) should behave like the DOM element they wrap, so consumers can focus, measure, scroll or attach tooltips and popovers to them.
- **Composition libraries** (Radix-style `asChild`, floating-UI positioning) need the underlying DOM node.
- **Wrapping third-party components** while keeping their ref API.

## Exposing less than the DOM node

Handing out the raw node lets consumers do anything to it. `useImperativeHandle` lets you expose a narrow API instead:

```jsx
function VideoPlayer({ src, ref }) {
  const videoRef = useRef(null);
  useImperativeHandle(ref, () => ({
    play: () => videoRef.current.play(),
    pause: () => videoRef.current.pause(),
  }), []);
  return <video ref={videoRef} src={src} />;
}
```

## Pitfalls

- **HOCs swallowing refs.** A `withTracking(Button)` wrapper must forward `ref` too, or consumers get the wrapper (or nothing). In React 19 it's passed with the rest of the props automatically if you spread `{...props}`.
- **`displayName`.** Anonymous `forwardRef(() => …)` shows up as `ForwardRef` in DevTools. Use a named function.
- **TypeScript.** `forwardRef<HTMLInputElement, Props>` generics were awkward. In React 19 you type `ref?: React.Ref<HTMLInputElement>` as a prop (or use `ComponentProps<'input'>`, which now includes `ref`).
- **Overusing imperative refs.** Prefer props and state. Refs are for focus, measurement, media and integration.

## In an interview, mention…

- Why it existed: `ref` wasn't a regular prop for function components.
- React 19 makes `ref` a prop, and `forwardRef` is on the path to deprecation (a codemod exists).
- Design-system components should forward refs to their root DOM node.
- `useImperativeHandle` to limit what you expose.
