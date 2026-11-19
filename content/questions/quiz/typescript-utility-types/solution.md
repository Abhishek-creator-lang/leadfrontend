## TL;DR

TypeScript ships **built-in generic helpers** that transform types so you derive them instead of duplicating them. **Object shape:** `Partial<T>`, `Required<T>`, `Readonly<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`. **Unions:** `Exclude<U, E>`, `Extract<U, E>`, `NonNullable<T>`. **Functions and classes:** `ReturnType<F>`, `Parameters<F>`, `ConstructorParameters<C>`, `InstanceType<C>`, `ThisParameterType`, `OmitThisParameter`. **Promises:** `Awaited<T>`. **Strings:** `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`. **Inference:** `NoInfer<T>` (5.4). Most are one-line mapped or conditional types.

## Object utilities

```ts
interface User {
  id: string;
  name: string;
  email?: string;
  role: 'admin' | 'member';
}

type UserPatch = Partial<Omit<User, 'id'>>;      // everything optional except id is removed
type NewUser = Omit<User, 'id'>;                 // payload for creation
type UserPreview = Pick<User, 'id' | 'name'>;
type CompleteUser = Required<User>;              // email is now required
type FrozenUser = Readonly<User>;                // shallow readonly
type UsersById = Record<User['id'], User>;
type RoleLabels = Record<User['role'], string>;  // must have both 'admin' and 'member'
```

`Record<Union, V>` is great for **exhaustive maps**: adding a new role forces you to add a label.

## Union utilities

```ts
type Status = 'idle' | 'loading' | 'success' | 'error';
type Busy = Extract<Status, 'loading'>;           // 'loading'
type Settled = Exclude<Status, 'idle' | 'loading'>; // 'success' | 'error'
type Defined = NonNullable<string | null | undefined>; // string
```

## Function and class utilities

```ts
async function fetchUser(id: string, opts?: { cache: boolean }) {
  return { id, name: 'Ada' };
}

type FetchArgs = Parameters<typeof fetchUser>;           // [id: string, opts?: {...}]
type FetchResult = Awaited<ReturnType<typeof fetchUser>>; // { id: string; name: string }

class Store { constructor(public name: string) {} }
type StoreArgs = ConstructorParameters<typeof Store>; // [name: string]
type StoreInstance = InstanceType<typeof Store>;      // Store
```

Deriving from implementations keeps types in sync with code, which is useful for third-party functions whose types aren't exported.

## How they're built

```ts
type Partial<T> = { [P in keyof T]?: T[P] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
type Exclude<T, U> = T extends U ? never : T;
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
```

## Pitfalls

- **`Omit` isn't strict:** `Omit<User, 'idd'>` compiles (`K extends keyof any`), so typos go unnoticed. Some teams define a `StrictOmit<T, K extends keyof T>`.
- **`Omit` and `Pick` on unions** don't distribute. `Omit<A | B, 'x'>` collapses to the common keys. Use a distributive version (`T extends unknown ? Omit<T, K> : never`).
- **`Partial` and `Readonly` are shallow.** Write or use a `DeepPartial`/`DeepReadonly` when needed.
- **`ReturnType` of overloaded functions** uses the last overload.
- **`Record<string, V>`** claims every key exists. With `noUncheckedIndexedAccess`, reads become `V | undefined`. Otherwise consider `Partial<Record<…>>` or `Map`.

## In an interview, mention…

- The main families, with one practical example each (patch payloads, exhaustive maps, deriving from functions).
- `Awaited<ReturnType<typeof fn>>` for async APIs.
- Pitfalls: non-strict `Omit`, non-distributive `Omit` on unions, shallow `Partial`.
- They're implemented with mapped and conditional types, so you can write your own.
