## TL;DR

`useId()` (React 18+) returns a **unique, stable string id per component instance that is identical on the server and the client**, so it's safe for SSR and hydration. Use it to **link elements for accessibility**: `htmlFor`/`id`, `aria-describedby`, `aria-labelledby`, `aria-controls`. **Don't use it for list keys** or as a database id, and don't use it as a CSS selector without escaping.

## Why not a counter or Math.random()?

```jsx
let nextId = 0;
function Field() {
  const id = `field-${nextId++}`; // breaks with SSR, Strict Mode and concurrent rendering
}
```

- On the server and client, components can render in different orders or different numbers of times. The ids don't match, which causes **hydration mismatches** and broken label associations.
- Strict Mode double rendering and concurrent re-renders increment the counter unpredictably.
- `Math.random()` is different on every render.

`useId` derives the id from the component's **position in the tree** (its "parent path"), which is the same on the server and the client.

## Usage

```jsx
function PasswordField({ label, hint }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="password" aria-describedby={`${id}-hint`} />
      <p id={`${id}-hint`}>{hint}</p>
    </div>
  );
}
```

Call `useId` **once** per component and derive related ids with suffixes. Each `<PasswordField />` instance on the page gets its own id, so you can render the component many times without collisions.

## Details worth knowing

- **Format:** the string is opaque. React 18 produced ids like `:r1:`. React 19.1 changed the format to `«r1»`, and React 19.2 changed it again to `_r_1_`, partly so ids are valid in more CSS selector contexts and for View Transitions. Never parse or depend on the format.
- **Selectors:** if you must use it in `querySelector`, wrap it with `CSS.escape(id)`. Better still, use a ref.
- **Multiple React roots on one page:** set `identifierPrefix` in `createRoot`/`hydrateRoot` (and the matching server render options) so ids from separate apps can't collide.
- **Same rules as other hooks:** top level only, and it can't be called in a loop to generate one id per item. Derive per-item ids from data (`${id}-${item.id}`) or move each item into its own component.

## Pitfalls

- **Keys:** `key={useId()}` is wrong. Keys must come from your data and be known when the list is built.
- **Stable only while mounted:** if the component remounts, the id may change. Don't persist it.
- **Server/client tree mismatch:** `useId` only matches if the component trees match. Conditional rendering based on `typeof window` breaks it, along with hydration in general.

## In an interview, mention…

- The purpose: SSR-safe unique ids for accessibility attributes.
- It's tree-position based, which is why it matches between server and client while counters don't.
- Not for keys, and use `identifierPrefix` for multiple roots.
- The format is opaque and has changed across 18 → 19.x.
