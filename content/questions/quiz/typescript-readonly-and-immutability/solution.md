## TL;DR

TypeScript offers **compile-time immutability**: the **`readonly` property modifier**, **`readonly` arrays and tuples** (`readonly T[]`, `ReadonlyArray<T>`), **`Readonly<T>`**, `ReadonlyMap`/`ReadonlySet`, and **`as const`** for deeply readonly literals. They prevent **writes through that reference** at compile time, but there's **no runtime enforcement** (use `Object.freeze` for that), they're **shallow** unless you write a `DeepReadonly`, and **aliasing** means another, mutable reference can still change the same object. Their main value is **API contracts**: a function that takes `readonly T[]` promises not to mutate your array.

## The tools

```ts
interface Config {
  readonly apiUrl: string;
  retries: number;
}
const cfg: Config = { apiUrl: '/api', retries: 3 };
cfg.apiUrl = '/v2'; // error

function total(prices: readonly number[]) {
  prices.push(1);   // error: push doesn't exist on readonly number[]
  return prices.reduce((a, b) => a + b, 0);
}

type FrozenUser = Readonly<User>;          // all top-level props readonly
const point = [1, 2] as const;             // readonly [1, 2]
const lookup: ReadonlyMap<string, number> = new Map([['a', 1]]);
```

Class fields can be `readonly` (assignable only in the declaration or constructor), and so can parameter properties: `constructor(private readonly repo: Repo) {}`.

## Shallow by default

```ts
const state: Readonly<{ user: { name: string } }> = { user: { name: 'Ada' } };
state.user = { name: 'Bob' }; // error
state.user.name = 'Bob';      // allowed: nested object isn't readonly
```

A recursive helper:

```ts
type DeepReadonly<T> =
  T extends (...args: any[]) => unknown ? T
  : T extends ReadonlyMap<infer K, infer V> ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends ReadonlySet<infer U> ? ReadonlySet<DeepReadonly<U>>
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;
```

## Readonly isn't "immutable"

```ts
const original = { count: 0 };
const view: Readonly<typeof original> = original;
original.count++;     // fine, and `view.count` is now 1
```

`readonly` describes what **this reference** may do. It doesn't freeze the object. Also, **mutable and readonly object types are mutually assignable** (`Readonly<T>` can be assigned back to `T`), which is a known soundness gap. Readonly **arrays** are stricter: `readonly T[]` isn't assignable to `T[]`.

## Runtime immutability

- `Object.freeze(obj)` is shallow, throws in strict mode on write, and TypeScript types it as `Readonly<T>`.
- Immer produces structurally shared immutable updates (and freezes in development).
- Immutable.js and similar libraries use persistent data structures, which are heavier.

## In React and state management

- Typing props and state as readonly (`readonly Todo[]`) catches accidental `push` or `sort` on state.
- Prefer non-mutating methods: `toSorted`, `toReversed`, `toSpliced`, `with` (ES2023, typed in TS 5.2+ via `lib: ["es2023"]`).
- Redux Toolkit and Zustand with Immer let you "mutate" drafts while keeping real state immutable.

## Pitfalls

- Friction: readonly arrays can't be passed to functions typed `T[]`, so fix the signatures to accept `readonly T[]`.
- `as const` on large config objects makes every literal type narrow, which is sometimes too specific. Combine it with `satisfies`.
- Methods can still mutate internal state. `readonly` on a property doesn't stop `obj.items.push()` or a method call that changes the object.

## In an interview, mention…

- `readonly`, `Readonly<T>`, `ReadonlyArray`, `as const`, and readonly collection types.
- Compile-time only, shallow, and reference-based (aliasing). Use `Object.freeze` or Immer for runtime.
- Readonly parameters as an API contract, and readonly-to-mutable assignability gaps.
- ES2023 non-mutating array methods for immutable updates.
