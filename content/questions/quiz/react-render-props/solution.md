## TL;DR

A render prop is a **prop whose value is a function that returns React elements**. The component calls it to **delegate part of its rendering to the caller**, while it supplies the data or behaviour. `children` as a function is the most common form: `<Mouse>{pos => <Cursor {...pos} />}</Mouse>`. It was a key pattern for **sharing stateful logic with caller-controlled UI** before hooks. Today most logic sharing uses **custom hooks**, but render props are still the right tool when a component must **control *where* or *when* caller UI renders**: list item renderers, virtualized rows, headless components, and slots that need internal state.

## Example

```jsx
function DataList({ items, renderItem, renderEmpty = () => <p>No results</p> }) {
  if (items.length === 0) return renderEmpty();
  return (
    <ul>
      {items.map((item, index) => (
        <li key={item.id}>{renderItem(item, { index, isLast: index === items.length - 1 })}</li>
      ))}
    </ul>
  );
}

<DataList
  items={users}
  renderItem={(user, { isLast }) => <UserRow user={user} divider={!isLast} />}
/>
```

`DataList` owns the structure (list semantics, keys, the empty state) and the caller owns each item's look.

## Children as a function

```jsx
function Toggle({ children }) {
  const [on, setOn] = useState(false);
  return children({ on, toggle: () => setOn(o => !o) });
}

<Toggle>
  {({ on, toggle }) => (
    <button aria-pressed={on} onClick={toggle}>{on ? 'On' : 'Off'}</button>
  )}
</Toggle>
```

## Render props vs hooks

The same `Toggle` as a hook:

```jsx
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  return { on, toggle: useCallback(() => setOn(o => !o), []) };
}
```

Hooks avoid nesting ("callback pyramids" of several render-prop components), don't add components to the tree, and type more easily. Prefer hooks when the caller just needs **values**.

Render props still win when the provider needs to **render** the result itself:

- **Virtualization:** `<List rowCount={10000}>{({ index, style }) => <Row style={style} … />}</List>`. Only the library knows which rows to render, and where.
- **Headless components** with internal layout (Downshift's original API, TanStack Table's cell renderers, form libraries' `<Field render>`).
- **Context-like scoping in one place:** for example, a `<Formik>` child function.
- **Server Components:** you can't pass functions from server to client components, so render props are limited across that boundary. Pass elements (`children`/slots) instead.

## Pitfalls

- **Inline functions break `memo`** on the receiving component (a new function each render). It's usually fine. Memoize, or rely on the React Compiler, if it matters.
- **Deep nesting** hurts readability. Extract a hook or a component.
- **Calling the render prop as a component** (`<renderItem />`) is wrong. It's a function, so call it.
- Keys belong on the element the *provider* maps over, not inside the caller's output.

## In an interview, mention…

- Definition: a function prop that returns UI, giving inversion of control over rendering.
- History: HOCs, then render props, then hooks for logic reuse.
- Where they still fit: virtualization, headless components, item renderers.
- Trade-offs: nesting, identity and memo, and the RSC boundary limitation.
