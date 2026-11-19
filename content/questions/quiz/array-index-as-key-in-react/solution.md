## TL;DR

An index key ties an element's identity to its **position**, not its data. When the list is **reordered, filtered, or has items inserted or removed anywhere except the end**, React matches the wrong old element to each new item. **Component state, uncontrolled input values, focus and DOM nodes stay at the old position** and appear attached to the wrong item. It also causes unnecessary re-renders. Index keys are only safe for static lists whose items have no state.

## A concrete bug

```jsx
function Todos() {
  const [todos, setTodos] = useState([
    { id: 'a', text: 'Write tests' },
    { id: 'b', text: 'Ship it' },
  ]);

  const addToTop = () =>
    setTodos(t => [{ id: crypto.randomUUID(), text: 'New task' }, ...t]);

  return (
    <>
      <button onClick={addToTop}>Add</button>
      <ul>
        {todos.map((todo, i) => (
          <li key={i}>
            {todo.text} <input placeholder="notes" />
          </li>
        ))}
      </ul>
    </>
  );
}
```

Type "urgent" into the notes for "Write tests", then click **Add**:

- Before: key 0 → "Write tests" (input: "urgent"), key 1 → "Ship it".
- After: key 0 → "New task", key 1 → "Write tests", key 2 → "Ship it".

React sees key 0 still exists, so it **reuses that `<li>` and its `<input>` DOM node** and only updates the text. "urgent" now sits next to "New task". The same happens with `useState` inside a row component: state follows the key, not the data.

Use `key={todo.id}` and React will insert one new `<li>` at the top and leave the others untouched.

## Performance cost

With index keys, inserting at the front changes the props of *every* row (each index now holds a different item), so every row re-renders and `React.memo` can't help. With stable keys, only the new row renders, and the rest are moved or kept.

## When an index key is fine

All of these must hold:

1. The list never reorders or filters, and items are only ever appended at the end, or the list never changes at all.
2. Items have no local state, uncontrolled inputs, or focusable/animated DOM that must follow the item.
3. There's no natural id.

Examples: a static breadcrumb, rendered paragraphs of fixed text, skeleton placeholders.

## Better alternatives

- Use the data's id (`todo.id`, `user.slug`).
- Generate an id **when the item is created** (`crypto.randomUUID()` in the event handler, as above) and store it with the item.
- For derived lists without ids, build a composite key from stable fields (`${row.date}-${row.account}`), but only if that combination is unique.
- **Never** generate keys during render (`key={Math.random()}`). That remounts every row on every render.

## In an interview, mention…

- Keys define identity, and identity determines where state and DOM nodes go.
- Walk through the "insert at top" example: input values and focus get attached to the wrong row.
- The performance cost: every row re-renders and memoization is defeated.
- The narrow conditions under which an index key is acceptable, and that ESLint (`react/no-array-index-key`) can flag it.
