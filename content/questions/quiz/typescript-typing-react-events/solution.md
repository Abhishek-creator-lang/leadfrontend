## TL;DR

React passes **synthetic events** typed by `@types/react` as **`React.<Kind>Event<ElementType>`**: `React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent<HTMLButtonElement>`, `React.KeyboardEvent<HTMLDivElement>`, `React.FormEvent<HTMLFormElement>`, `React.FocusEvent`, `React.PointerEvent`, `React.DragEvent`, `React.ClipboardEvent` and so on. **Inline handlers are inferred automatically**, so you only write types for **extracted handlers** or **callback props**, where `React.<Kind>EventHandler<El>` or the event type is the right annotation. Know the difference between **`currentTarget`** (the element the handler is attached to, typed by the generic) and **`target`** (whatever was actually clicked, typed loosely as `EventTarget`).

## Inline: no annotation needed

```tsx
<input onChange={e => setName(e.target.value)} />   // e: React.ChangeEvent<HTMLInputElement>
<button onClick={e => e.currentTarget.blur()} />      // e: React.MouseEvent<HTMLButtonElement>
```

## Extracted handlers

```tsx
function SignupForm() {
  const [email, setEmail] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // ...
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === 'Escape') e.currentTarget.blur();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={handleChange} onKeyDown={handleKeyDown} />
    </form>
  );
}
```

`React.KeyboardEventHandler<T>` is shorthand for `(event: React.KeyboardEvent<T>) => void`.

Tip: hover over the `onChange` prop in your editor to see the exact expected type, then copy it.

## target vs currentTarget

```tsx
function List() {
  const handleClick = (e: React.MouseEvent<HTMLUListElement>) => {
    e.currentTarget;               // HTMLUListElement
    const li = (e.target as HTMLElement).closest('li'); // target is EventTarget; narrow it
    if (li) console.log(li.dataset.id);
  };
  return <ul onClick={handleClick}>{/* ... */}</ul>;
}
```

For event delegation, narrow `target` with `instanceof` (`if (e.target instanceof HTMLButtonElement)`) instead of casting.

## One handler for several inputs

```tsx
const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setForm(f => ({ ...f, [name]: value }));
};
```

## Callback props: expose data, not events

```tsx
type SearchProps = { onSearch: (query: string) => void }; // better than (e: ChangeEvent) => void
```

Passing domain values keeps components decoupled from DOM details and easier to test.

## Native vs synthetic events

- `e.nativeEvent` gives the underlying DOM event (`MouseEvent`, `InputEvent`, etc.).
- `useEffect` listeners attached with `addEventListener` use **DOM types** (`KeyboardEvent`, not `React.KeyboardEvent`):

```tsx
useEffect(() => {
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, [close]);
```

- React 17+ attaches listeners at the root container, and `e.persist()` is a no-op (there's no more event pooling).

## Pitfalls

- Using `React.ChangeEvent<HTMLElement>`: then `e.target.value` doesn't exist. Use the specific element type.
- Confusing `React.MouseEvent` with the DOM's global `MouseEvent` (an import or naming mix-up).
- Typing `onChange` for a custom component as a DOM event when callers only need a value.
- `FormEvent` vs `SubmitEvent`: React's `onSubmit` uses `React.FormEvent`. The native `submitter` is on `e.nativeEvent` (as `SubmitEvent`).

## In an interview, mention…

- `React.XxxEvent<Element>` types, and that inference handles inline handlers.
- `XxxEventHandler<El>` aliases for extracted handlers.
- `currentTarget` vs `target`, and narrowing with `instanceof`.
- DOM types for `addEventListener`, and callback props that pass values rather than events.
