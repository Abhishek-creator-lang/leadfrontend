## TL;DR

`key` gives an element a **stable identity among its siblings**, so React's reconciler can match items between renders. Elements are matched by **type plus key** instead of by position, which lets React **move, insert and delete** the right DOM nodes and **keep each item's state attached to the right item**. Keys must be unique among siblings and stable across renders. They are usually an id from your data.

## Why React needs it

When a list re-renders, React compares the old children with the new ones. Without keys it can only compare by index: "the 1st child is still the 1st child". If you insert an item at the top, every item shifts. React then thinks every row changed and re-renders all of them, and any **state inside a row (input text, focus, expanded flag) stays with the index, not the data**.

```jsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <TodoRow key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
```

With `key={todo.id}`, prepending a todo means React creates one new `TodoRow`, reuses the existing ones (moving their DOM nodes if needed), and each row keeps its own state.

## Rules

- **Unique among siblings**, not globally. Two different lists can reuse the same keys.
- **Stable.** The same item gets the same key on every render. Never use `Math.random()` or `crypto.randomUUID()` during render. It remounts every item on every render, loses state and focus, and is slow.
- **Comes from the data.** Database ids, slugs, or an id you generate *when the item is created* and store with it.
- **Index is acceptable only** when the list is static: never reordered, filtered or inserted into, and items have no state.
- **Not readable as a prop.** `props.key` is undefined. Pass `id` separately if the child needs it.
- **Goes on the outermost element in the map.** For fragments, use `<Fragment key={id}>`. The short `<>` syntax can't take a key.

## Keys outside lists: resetting state

React preserves state while the same component type stays at the same position. Changing the `key` tells React it's a **different instance**, so it unmounts the old one and mounts a fresh one:

```jsx
<ProfileForm key={userId} userId={userId} />
```

Switching users now resets the form's local state without any `useEffect` syncing. This is the idiomatic way to "reset state when a prop changes".

## Pitfalls

- Duplicate keys produce a console warning and unpredictable updates. Items can be duplicated or dropped.
- Keys on the wrong element (on the inner `<li>` instead of the mapped component) do nothing.
- Keying by an unstable value such as `item.name` when names can change remounts the row on rename.
- Changing the key of a large subtree is a full remount. Effects re-run and child state is lost. That's sometimes exactly what you want, and sometimes an expensive accident.

## In an interview, mention…

- Reconciliation matches children by type plus key. Keys turn the comparison from positional to identity-based.
- State lives with the key, which is why index keys cause state to "jump" between rows.
- Using `key` to deliberately reset a component.
- Keys must be stable and sibling-unique. Random keys are worse than no keys.
