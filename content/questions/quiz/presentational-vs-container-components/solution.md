## TL;DR

This pattern splits components into **container components**, which handle *how things work* (fetching data, holding state, connecting to stores, defining callbacks), and **presentational components**, which handle *how things look* (they receive data and callbacks via props, render markup and styles, and hold no business logic). The benefit is **separation of concerns**: presentational pieces are reusable, easy to test, and easy to put in Storybook. Since hooks, the strict split is **no longer necessary**. Custom hooks extract the logic instead of wrapper components. The underlying idea, **keeping UI components dumb and logic in a separate unit**, still matters, and Server vs Client Components echo it.

## Classic example

```jsx
// Presentational: pure UI, props in, events out
function UserList({ users, onSelect, selectedId }) {
  return (
    <ul role="listbox" aria-label="Users">
      {users.map(u => (
        <li
          key={u.id}
          role="option"
          aria-selected={u.id === selectedId}
          onClick={() => onSelect(u.id)}
        >
          {u.name}
        </li>
      ))}
    </ul>
  );
}

// Container: data and behaviour
function UserListContainer() {
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const [selectedId, setSelectedId] = useState(null);
  return <UserList users={users} selectedId={selectedId} onSelect={setSelectedId} />;
}
```

## Benefits

- **Reusability:** `UserList` works with data from anywhere.
- **Testability:** render with fixture props, with no network or store mocking.
- **Design-system friendly:** presentational components document well in Storybook.
- **Parallel work:** designers and UI engineers iterate on the view while others work on data.

## Why Dan Abramov (who popularized it) later said not to split dogmatically

- Hooks let you extract logic without an extra component:

```jsx
function useUsers() {
  const query = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const [selectedId, setSelectedId] = useState(null);
  return { users: query.data ?? [], selectedId, setSelectedId };
}
```

- Forcing every component into two files adds indirection and prop plumbing for little gain.
- The split often happens naturally anyway: design-system components are presentational, while feature/page components combine logic and layout.

## Modern equivalents

- **Custom hooks** as the "container logic", and components as the view.
- **Headless UI libraries** (Radix, React Aria, TanStack Table) provide behaviour and accessibility through hooks or primitives, and you supply the presentation.
- **Server Components vs Client Components:** server components fetch data (container-like) and pass it to interactive client components. The boundary is driven by where code runs, not by purity, but the result often looks similar.

## Pitfalls

- Presentational components that secretly fetch or read global stores. That breaks reuse and tests.
- Containers that grow into "god components". Split by feature, not by layer.
- Excessive prop drilling from a top-level container. Use composition or colocate data needs.

## In an interview, mention…

- The definition: logic vs view, and the benefits (reuse, testing, Storybook).
- Hooks made the strict pattern optional, with custom hooks as the modern "container".
- Headless components and the RSC/client split as today's versions of the idea.
- Apply it pragmatically, not dogmatically.
