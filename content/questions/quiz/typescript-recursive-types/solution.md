## TL;DR

A recursive type **refers to itself in its own definition**, which is how you model **trees, nested menus, JSON, comment threads, file systems and linked lists**, and how you write **deep type transformations** (`DeepPartial`, `DeepReadonly`, dotted `Paths<T>`). Interfaces and object type aliases have always supported recursion through properties. Since **TS 3.7** type aliases can recurse through arrays and tuples, and since **TS 4.1** conditional types can be recursive. The main costs are **compiler performance** and **instantiation depth limits** ("Type instantiation is excessively deep and possibly infinite"). TS 4.5 added **tail-recursion elimination** for conditional types, which helps.

## Data structures

```ts
interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}

type MenuItem = {
  label: string;
  href?: string;
  items?: MenuItem[];
};

type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

const payload: Json = { user: { tags: ['a', 'b'], active: true } };
// const bad: Json = { when: new Date() }; // error: Date is not Json
```

Recursive components follow the type naturally:

```tsx
function Menu({ items }: { items: MenuItem[] }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.label}>
          {item.href ? <a href={item.href}>{item.label}</a> : item.label}
          {item.items && <Menu items={item.items} />}
        </li>
      ))}
    </ul>
  );
}
```

## Deep transformations

```ts
type DeepPartial<T> =
  T extends (...args: any[]) => unknown ? T
  : T extends readonly (infer U)[] ? DeepPartial<U>[]
  : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

type Settings = { theme: { mode: 'dark' | 'light'; accent: string }; locale: string };
const patch: DeepPartial<Settings> = { theme: { mode: 'dark' } }; // OK
```

Watch for built-ins like `Date`, `Map` and `Set`, which are `object`s. Special-case them so you don't map their methods.

## Type-level recursion over strings and tuples

```ts
type Join<T extends readonly string[], Sep extends string> =
  T extends readonly [infer H extends string, ...infer R extends string[]]
    ? R['length'] extends 0 ? H : `${H}${Sep}${Join<R, Sep>}`
    : '';

type J = Join<['a', 'b', 'c'], '/'>; // 'a/b/c'
```

**Tail-recursive form** (an accumulator, with the recursive call as the whole branch result) lets TS 4.5+ recurse up to about 1,000 levels instead of about 50:

```ts
type Reverse<T extends unknown[], Acc extends unknown[] = []> =
  T extends [infer H, ...infer R] ? Reverse<R, [H, ...Acc]> : Acc;
```

## Performance and limits

- Deep recursive types on large models (`Paths<T>` over a big API schema) can make the editor sluggish. Limit depth with a counter tuple (`Depth extends unknown[]`, stopping at length N).
- Unions inside recursion can explode combinatorially.
- Use `tsc --extendedDiagnostics` or `--generateTrace` to find expensive types.
- Prefer simple recursive *data* types. Be cautious with recursive *computed* types in hot paths of a shared library.

## Runtime counterpart

A type like `Json` doesn't validate anything at runtime. For recursive schemas, Zod's `z.lazy(() => …)` (or similar) builds the validator and infers the type.

## In an interview, mention…

- Recursive data types (trees, menus, JSON) and recursive components that mirror them.
- Deep utility types, and special-casing functions, arrays and built-ins.
- TS 4.1 recursive conditionals, TS 4.5 tail-recursion, and depth limits.
- Performance diagnostics, and runtime validation with lazy schemas.
