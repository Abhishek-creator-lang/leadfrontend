## TL;DR

**Props** are inputs a component **receives from its parent**. They are read-only from the child's point of view. **State** is data a component **owns and manages itself** (via `useState`/`useReducer`), and it persists between renders. Changing either causes a re-render, but only the owner can change state: a child that wants to change its parent's state calls a callback prop. **Props flow down, events flow up.**

## Side by side

| | Props | State |
|---|---|---|
| Owned by | The parent | The component itself |
| Mutable by the component? | No, treat as read-only | Yes, via the setter only |
| Persists across renders? | Whatever the parent passes each render | Yes, React stores it on the fiber |
| Purpose | Configure and parameterize | Remember things that change over time |
| Triggers re-render | When the parent re-renders with new values | When the setter is called with a different value (`Object.is`) |

```jsx
function Parent() {
  const [count, setCount] = useState(0);        // state, owned here
  return <Counter value={count} onIncrement={() => setCount(c => c + 1)} />;
}

function Counter({ value, onIncrement }) {      // props, read-only here
  return <button onClick={onIncrement}>{value}</button>;
}
```

`count` is **state** in `Parent` and a **prop** in `Counter`. The same piece of data can be both, depending on where you stand.

## Design guidance

- **Keep state minimal.** If a value can be computed from props or other state during render, compute it instead of storing it. `fullName = first + ' ' + last` should never be state.
- **Lift state up** to the closest common parent when two siblings need the same data.
- **Don't copy props into state** unless you mean "initial value":

```jsx
// Bug: ignores later changes to props.color
function Swatch({ color }) {
  const [c] = useState(color);
  return <div style={{ background: c }} />;
}
```

If you really want a seed value, name it `initialColor`. If the component should fully reset when the prop changes, give it a `key`.

- **Controlled vs uncontrolled.** A component is controlled when the value comes from props (plus a change callback) and uncontrolled when it keeps the value in its own state. Good shared components often support both.

## Pitfalls

- **Mutating props or state** (`props.items.push(x)`, `state.list.push(x)`). React compares by reference, so the mutation may not re-render and breaks memoization.
- **Stale state in closures.** State is a snapshot per render. Use updater functions (`setCount(c => c + 1)`) when the next value depends on the previous one.
- **Prop drilling.** Passing props through many layers is fine for a few levels. After that, consider composition (pass elements as `children`) or context.

## Beyond local state

Context, URL params, server caches (TanStack Query, framework loaders) and external stores are all "state" with different owners. The same questions apply: who owns it, who may change it, and how do consumers subscribe?

## In an interview, mention…

- Props are an input contract, state is private memory.
- The data-down, callbacks-up pattern and lifting state.
- Derived data shouldn't be state, and copying props into state is an anti-pattern.
- React compares by reference, so treat both as immutable.
