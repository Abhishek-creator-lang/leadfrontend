## TL;DR

React detects changes by **reference equality (`Object.is`)**, not by deep comparison. If you mutate an object or array and pass the same reference to the setter, **React may skip the re-render entirely**. Even when something else triggers a render, mutation **breaks `memo`, `useMemo`, effect dependencies and the React Compiler**, corrupts previous-render snapshots (closures, transitions, DevTools), and makes concurrent rendering unsafe. Treat state as **immutable**: create new objects or arrays with the change.

## The bug

```jsx
function TodoList() {
  const [todos, setTodos] = useState([]);

  function add(text) {
    todos.push({ id: crypto.randomUUID(), text }); // mutation
    setTodos(todos);                                // same reference, so React bails out
  }
}
```

`Object.is(todos, todos)` is `true`, so React considers the state unchanged and may skip rendering. The UI is stuck until an unrelated update happens, then suddenly "catches up". These are confusing, intermittent bugs.

```jsx
function add(text) {
  setTodos(prev => [...prev, { id: crypto.randomUUID(), text }]);
}
```

## Why immutability matters beyond re-rendering

1. **Cheap change detection.** `prev !== next` is O(1). This powers `memo`, `useMemo`/`useCallback` dependencies, `useEffect` dependencies, context propagation, and external-store selectors.
2. **Snapshots stay valid.** Each render closes over its own state. Event handlers, timeouts and effects from earlier renders expect their snapshot not to change underneath them.
3. **Concurrent rendering.** With transitions, React may render a new tree in the background while the current one is on screen, and may throw that render away. Mutating shared objects lets an abandoned render leak into the visible UI.
4. **Strict Mode and the Compiler.** Double-invoked renders and reducers assume purity. The React Compiler memoizes based on the assumption that props and state are never mutated.
5. **Debugging.** Time-travel (Redux DevTools), undo/redo and "what changed?" in the Profiler all rely on previous values staying intact.

## Immutable update patterns

```jsx
// Object field
setUser(u => ({ ...u, name: 'Ada' }));

// Nested
setUser(u => ({ ...u, address: { ...u.address, city: 'Pune' } }));

// Arrays
setItems(xs => [...xs, item]);                         // add
setItems(xs => xs.filter(x => x.id !== id));           // remove
setItems(xs => xs.map(x => x.id === id ? { ...x, done: true } : x)); // update
setItems(xs => xs.toSorted(compare));                  // sort without mutating (ES2023)
```

Watch for mutating methods: `push`, `splice`, `sort`, `reverse`, and direct assignment (`obj.x = 1`). ES2023 adds non-mutating versions: `toSorted`, `toReversed`, `toSpliced`, `with`.

**Immer** lets you write "mutating" code against a draft and produces an immutable result, which is useful for deep updates:

```jsx
setUser(produce(draft => { draft.address.city = 'Pune'; }));
```

## Pitfalls

- **Shallow copies** don't protect nested objects. `{ ...state }` still shares `state.address`.
- **Mutating props**, including arrays passed down, is just as bad.
- **Refs are the exception:** `ref.current` is meant to be mutated, but it won't trigger renders.
- **Deeply nested state** usually means you should normalize it (by id), so updates stay shallow.

## In an interview, mention…

- `Object.is` reference comparison means mutation equals "no change".
- The knock-on effects: memoization, effect dependencies, snapshots, concurrent rendering, Strict Mode and the Compiler.
- Immutable patterns, ES2023 non-mutating methods, and Immer for deep updates.
- Normalizing state to keep updates shallow.
