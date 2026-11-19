## TL;DR

`as const` is a **const assertion** (TS 3.4+). It tells the compiler to infer the **narrowest possible type** for a literal expression: **string, number and boolean literals stay literal** (`'GET'` rather than `string`), **arrays become `readonly` tuples**, and **object properties become `readonly`** with literal types, recursively. It doesn't freeze anything at runtime. It's purely a type-level hint. It's the standard way to **derive union types from runtime values** (a single source of truth) and to get precise types for configuration and lookup tables.

## Before and after

```ts
const method = 'GET';                 // 'GET' (const declarations already keep primitive literals)
const config = { method: 'GET', retries: 3 };
// { method: string; retries: number }  (properties are widened because they're mutable)

const config2 = { method: 'GET', retries: 3 } as const;
// { readonly method: 'GET'; readonly retries: 3 }

const sizes = ['sm', 'md', 'lg'];            // string[]
const sizes2 = ['sm', 'md', 'lg'] as const;  // readonly ['sm', 'md', 'lg']
```

## Deriving types from values

```ts
export const ROLES = ['admin', 'editor', 'viewer'] as const;
export type Role = (typeof ROLES)[number]; // 'admin' | 'editor' | 'viewer'

function isRole(x: string): x is Role {
  return (ROLES as readonly string[]).includes(x);
}
```

You get one list usable at runtime (dropdown options, validation) and a type that can't drift from it. This is a popular alternative to `enum`:

```ts
export const Status = { Active: 'active', Archived: 'archived' } as const;
export type Status = (typeof Status)[keyof typeof Status]; // 'active' | 'archived'
```

## Tuples and function arguments

```ts
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = () => setOn(v => !v);
  return [on, toggle] as const; // readonly [boolean, () => void] rather than (boolean | (() => void))[]
}
const [on, toggle] = useToggle();
```

Without `as const`, the return type is an array of a union, so destructured items lose their individual types.

## Combining with satisfies

```ts
const breakpoints = { sm: 640, md: 768, lg: 1024 } as const satisfies Record<string, number>;
// literal values kept, shape validated
```

## `const` type parameters (TS 5.0)

Library authors can get `as const`-like inference without making callers write it:

```ts
function defineRoutes<const T extends readonly string[]>(r: T) { return r; }
const r = defineRoutes(['/a', '/b']); // readonly ['/a', '/b']
```

## Pitfalls

- **Readonly propagation:** an `as const` array can't be passed where a mutable `string[]` is expected. Accept `readonly string[]` in your function signatures.
- **Not runtime immutability.** Use `Object.freeze` if you need that (and note it's shallow).
- **`.includes` friction:** `ROLES.includes(someString)` errors because the parameter type is the literal union. Widen the array (as above) or write a guard.
- It only applies to literal expressions. `someVariable as const` is an error.

## In an interview, mention…

- Narrowest inference: literals, readonly tuples, readonly properties, recursively.
- Deriving unions from runtime arrays and objects as a single source of truth, and as an enum alternative.
- Tuple returns from custom hooks.
- Readonly friction, no runtime effect, and `const` type parameters as the library-side counterpart.
