## TL;DR

A generic component **declares a type parameter on the component function**, so the types of related props stay connected. In `<Select items={users} getLabel={u => u.name} onChange={u => …} />`, `u` is inferred as `User` everywhere. Write it as `function Select<T>(props: SelectProps<T>)`. In `.tsx` arrow functions use `<T,>` to avoid JSX parsing ambiguity. **Constrain** `T` when you need members (`T extends { id: string }`). TypeScript **infers** `T` from props at the call site, and you can pass it explicitly with `<Select<User> … />`. Wrappers like `memo` and `forwardRef` **lose generics**, so cast or (in React 19) avoid `forwardRef` entirely.

## Example: a typed list/select

```tsx
type SelectProps<T> = {
  items: readonly T[];
  value: T | null;
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  onChange: (item: T) => void;
  label: string;
};

export function Select<T>({ items, value, getKey, getLabel, onChange, label }: SelectProps<T>) {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value ? getKey(value) : ''}
        onChange={e => {
          const next = items.find(i => getKey(i) === e.target.value);
          if (next) onChange(next);
        }}
      >
        <option value="" disabled>Choose…</option>
        {items.map(item => (
          <option key={getKey(item)} value={getKey(item)}>{getLabel(item)}</option>
        ))}
      </select>
    </>
  );
}

// Usage: T inferred as User
<Select
  label="Owner"
  items={users}
  value={owner}
  getKey={u => u.id}
  getLabel={u => u.name}
  onChange={setOwner}   // must accept a User
/>
```

## Constraints and defaults

```tsx
type Identifiable = { id: string | number };

function DataTable<Row extends Identifiable>({ rows, columns }: {
  rows: Row[];
  columns: { [K in keyof Row]?: { header: string; render?: (v: Row[K], row: Row) => React.ReactNode } };
}) {
  // row.id is available for keys; column renderers get the exact value type per key
}
```

Connecting `keyof Row` to `Row[K]` gives each column renderer the precise cell type.

## Arrow functions in .tsx

```tsx
const List = <T,>({ items, render }: { items: T[]; render: (t: T) => React.ReactNode }) => (
  <ul>{items.map((t, i) => <li key={i}>{render(t)}</li>)}</ul>
);
```

`<T>` alone would be parsed as a JSX tag. `<T,>` or `<T extends unknown>` fixes it.

## Explicit type arguments

```tsx
<Select<User> items={[]} … />   // useful when inference has nothing to go on (empty array)
```

## Wrappers lose generics

```tsx
const MemoSelect = memo(Select); // type is now Select<unknown>
const TypedMemoSelect = memo(Select) as typeof Select; // common workaround
```

The same applies to `forwardRef` in React 18. In React 19, take `ref` as a regular prop (`ref?: React.Ref<HTMLSelectElement>`) and the component stays a plain generic function.

## Context and hooks

Generic hooks work naturally (`function useList<T>(initial: T[])`). Generic **context** doesn't: `createContext` is created once at module level, so its type can't vary per use. Use a factory (`createTypedContext<T>()`) or compound components that receive `T` through props.

## Pitfalls

- Inference picking a union from mismatched props (`items: User[]` with `value: Admin`). Annotate or constrain.
- Over-generic components: if `T` appears only once, it doesn't need to be generic.
- Variance issues with callbacks: `onChange: (item: T) => void` is checked contravariantly. That's usually what you want.

## In an interview, mention…

- Type parameters connect props (items, callbacks, value), and inference at the call site.
- The `<T,>` syntax in `.tsx`, constraints, and `keyof`/`T[K]` for column-like APIs.
- `memo`/`forwardRef` losing generics, and React 19's ref-as-prop helping.
- Generic context limitations and factory patterns.
