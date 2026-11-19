## TL;DR

A **component** is a function (or class) that returns UI. An **element** is the plain, immutable object you get from JSX (`<Button />`) that *describes* what to render: a type plus props. A **React node** is anything React can render: elements, strings, numbers, `null`/`undefined`/booleans (which render nothing), arrays of nodes, portals, and in React 19 promises/context via `use`. In short: **components produce elements, and elements are one kind of node.**

## Component

```jsx
function Greeting({ name }) {
  return <h1>Hello, {name}</h1>;
}
```

`Greeting` is the blueprint. You never call it yourself. React calls it during rendering, when it decides to, possibly more than once (Strict Mode calls it twice in development to catch impure renders).

## Element

```jsx
const el = <Greeting name="Ada" />;
// roughly: { $$typeof: Symbol(react.transitional.element), type: Greeting, props: { name: 'Ada' }, key: null }
```

JSX compiles to `jsx(Greeting, { name: 'Ada' })` with the automatic runtime (or `React.createElement` with the classic one). The result is a **lightweight description**, not a DOM node and not a component instance. Elements are:

- **Immutable.** To change the UI you render a new element, not mutate the old one.
- **Cheap.** Creating one doesn't render anything. `Greeting` hasn't run yet.
- **Typed by `type`.** A string (`'div'`) for host elements, or a function/class for composite ones.

React 19 changed the internal `$$typeof` symbol and stopped exposing `element.ref` (refs are now in `props.ref`). That's one reason you should never hand-craft element objects.

## Node

`ReactNode` (the TypeScript name is `React.ReactNode`) is the union of everything renderable:

```jsx
function List() {
  return (
    <>
      {'text'}          {/* string */}
      {42}              {/* number */}
      {null}            {/* renders nothing */}
      {false && <X />}  {/* renders nothing */}
      {[<li key="a" />, <li key="b" />]} {/* array of nodes */}
      <Greeting name="Ada" /> {/* element */}
    </>
  );
}
```

This is the type of `children`, so prefer `children: React.ReactNode` over `JSX.Element` when typing props.

## Why the distinction matters

- **Passing elements vs components.** `<Layout header={<Header />} />` passes an element, already configured by the parent. `<Layout Header={Header} />` passes a component, which the child renders with props it controls. The second gives the child more control. The first is simpler and keeps `Header` owned by the parent's state.
- **Calling a component as a function is a bug.** `{Greeting({ name })}` skips React's element and fiber machinery. Hooks inside it attach to the caller, keys and reconciliation don't apply, and you can't use DevTools on it.
- **Instances.** For class components React creates an instance per mounted element. Function components have no instance. Their state lives on the **fiber** React keeps for that position in the tree.

## Pitfalls

- `0 && <X />` renders `0` because numbers are valid nodes. Use `count > 0 && …`.
- Objects that aren't elements are not valid children ("Objects are not valid as a React child").
- `cloneElement` and inspecting `children` props couple you to element internals. Prefer explicit props or context.

## In an interview, mention…

- Component = function, element = description object, node = anything renderable.
- Elements are immutable snapshots, and React compares them during reconciliation.
- Typing: `ReactNode` for children, `ReactElement` only when you really need an element.
- React 19 moved `ref` into props, which also changed the element shape.
