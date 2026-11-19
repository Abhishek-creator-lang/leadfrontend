## TL;DR

Three type operators that let you **derive types from other types and from values** instead of repeating yourself:

- **`keyof T`** produces a **union of T's property keys** (`'id' | 'name'`).
- **`typeof value`** (in a type position) gets the **type of a runtime variable or property**. This is different from JavaScript's runtime `typeof`.
- **Indexed access `T[K]`** looks up the **type of a property** (or a union of properties). `T[number]` gives the element type of an array or tuple.

Combined (`keyof typeof obj`, `(typeof arr)[number]`, `T[keyof T]`) they keep types in sync with your code.

## keyof

```ts
interface User { id: number; name: string; email?: string }
type UserKey = keyof User; // 'id' | 'name' | 'email'

function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key]);
}
pluck(users, 'name');  // string[]
pluck(users, 'phone'); // error
```

Notes:

- With an index signature, `keyof { [k: string]: X }` is `string | number` (numeric keys are valid string keys in JS).
- `keyof` on a union gives only the **common** keys. On an intersection it gives all keys.
- `keyof any` is `string | number | symbol` (`PropertyKey`).

## typeof (type query)

```ts
const defaultConfig = { retries: 3, timeout: 5000, mode: 'cors' as RequestMode };
type Config = typeof defaultConfig; // { retries: number; timeout: number; mode: RequestMode }

function createClient() { return { get() {}, post() {} }; }
type Client = ReturnType<typeof createClient>;

import * as api from './api';
type Api = typeof api; // the module's export types
```

`typeof` only works on **identifiers and property accesses**, not arbitrary expressions (`typeof foo()` is invalid; use `ReturnType<typeof foo>`).

## Indexed access

```ts
type UserId = User['id'];                      // number
type IdOrName = User['id' | 'name'];           // number | string
type AnyValue = User[keyof User];              // number | string | undefined

const ROLES = ['admin', 'editor', 'viewer'] as const;
type Role = (typeof ROLES)[number];            // 'admin' | 'editor' | 'viewer'

type ApiResponse = { data: { items: { id: string; tags: string[] }[] } };
type Item = ApiResponse['data']['items'][number]; // { id: string; tags: string[] }
type Tag = Item['tags'][number];                  // string
```

Indexed access uses **types**, not values: `User['id']` is fine, but `const k = 'id'; User[k]` is an error. Use `User[typeof k]`.

## Putting them together

```ts
const STATUS_COLORS = {
  success: 'green',
  warning: 'orange',
  danger: 'red',
} as const;

type Status = keyof typeof STATUS_COLORS;                 // 'success' | 'warning' | 'danger'
type StatusColor = (typeof STATUS_COLORS)[Status];        // 'green' | 'orange' | 'red'

function Badge({ status }: { status: Status }) { /* STATUS_COLORS[status] is typed */ }
```

The runtime object is the single source of truth, and the types follow it automatically.

## Pitfalls

- `keyof typeof obj` without `as const` still works for keys, but values widen to `string`.
- `Object.keys(obj)` returns `string[]`, not `(keyof T)[]`, because objects may have extra keys at runtime (structural typing). Cast deliberately, or iterate over a typed key array.
- Optional properties make `T[K]` include `undefined`.

## In an interview, mention…

- `keyof` for key unions, `typeof` for types from values, and `T[K]` for property types.
- Combos such as `keyof typeof`, `(typeof arr)[number]` and `T[keyof T]` for a single source of truth.
- The `K extends keyof T` + `T[K]` generic pattern.
- Why `Object.keys` returns `string[]`.
