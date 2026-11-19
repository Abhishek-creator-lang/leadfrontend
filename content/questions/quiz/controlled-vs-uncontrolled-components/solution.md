## TL;DR

A **controlled** component gets its current value from **props or React state** and reports changes through a callback, so React is the single source of truth (`<input value={v} onChange={…} />`). An **uncontrolled** component **keeps its own state**, either in the DOM (`<input defaultValue="x" />`, read via a ref or `FormData`) or in the component's internal state, and the parent only gives an initial value. Controlled gives you full control (validation, formatting, syncing). Uncontrolled is simpler and avoids a re-render per keystroke.

## Form inputs

```jsx
// Controlled
function Search() {
  const [q, setQ] = useState('');
  return (
    <input
      value={q}
      onChange={e => setQ(e.target.value.trimStart())}
    />
  );
}

// Uncontrolled
function Signup() {
  function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    console.log(data.get('email'));
  }
  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" defaultValue="" required />
      <button>Sign up</button>
    </form>
  );
}
```

In React 19 you can also pass a function to `<form action={fn}>`. React calls it with the `FormData` and resets uncontrolled fields after a successful submit. This makes uncontrolled forms with Actions an official pattern rather than a workaround.

## Trade-offs

| | Controlled | Uncontrolled |
|---|---|---|
| Source of truth | React state | DOM / internal |
| Instant validation and formatting | Easy | Harder (read on blur or submit) |
| Conditional UI based on the value | Easy | Need a ref or events |
| Re-renders | Every change | None while typing |
| Boilerplate | More | Less |
| Integration with non-React code | Harder | Easier |

Large forms often use a library such as React Hook Form, which is uncontrolled by default for performance, or keep state local to each field to limit re-renders.

## The pattern generalizes beyond inputs

Any component can be controlled or uncontrolled. Think of a `Tabs`, `Accordion` or `Dialog`:

```jsx
function Tabs({ value, defaultValue, onChange, children }) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const active = isControlled ? value : internal;
  const select = next => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };
  // ...
}
```

Design-system components usually support **both** modes with the `value`/`defaultValue` convention. Libraries wrap this in a `useControllableState` hook.

## Pitfalls

- **Switching modes.** Passing `value={undefined}` and later a string triggers "A component is changing an uncontrolled input to be controlled". Initialize with `''`, not `undefined`/`null`.
- **`value` without `onChange`** produces a read-only input and a warning. Use `readOnly` or `defaultValue` if that's intended.
- **Changing `defaultValue` later** has no effect after mount. Use a `key` to reset the field.
- **File inputs** are always uncontrolled (`<input type="file">` can't be set programmatically).
- **Cursor jumps** when a controlled input's value is transformed asynchronously. Update state synchronously in `onChange`.

## In an interview, mention…

- Who owns the value: React (controlled) or the DOM/component (uncontrolled).
- The trade-off between control and re-render cost, and when you'd pick each.
- The `value`/`defaultValue`/`onChange` API for reusable components.
- React 19 form Actions make uncontrolled forms a first-class pattern.
