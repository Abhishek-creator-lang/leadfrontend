## TL;DR

Generics are **type parameters**. They let a function, class or type **work over many types while preserving the relationship between inputs and outputs** (`identity<T>(x: T): T`). **Constraints** (`T extends Something`) limit which types are allowed, so you can safely use members of `Something` inside. TypeScript usually **infers** type arguments from call sites. Good generic code uses **as few type parameters as necessary**, each appearing at least twice (otherwise use a concrete type). Modern helpers include **`const` type parameters** (TS 5.0) for literal inference and **`NoInfer<T>`** (TS 5.4) to stop a position from influencing inference.

## Basics

```ts
function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}
const n = first([1, 2, 3]);       // number | undefined
const s = first(['a', 'b']);      // string | undefined
```

Without generics you'd write `any` (losing the type) or overloads for every type.

## Constraints

```ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
longest('abc', 'de');        // string
longest([1, 2], [3]);        // number[]
longest(1, 2);               // error: number has no 'length'
```

**`keyof` constraints** relate parameters to each other:

```ts
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { id: 1, name: 'Ada' };
getProp(user, 'name');  // string
getProp(user, 'email'); // error
```

## Defaults and generic types

```ts
interface ApiResponse<TData = unknown, TError = Error> {
  data?: TData;
  error?: TError;
}

class TypedEmitter<Events extends Record<string, unknown[]>> {
  on<E extends keyof Events>(event: E, fn: (...args: Events[E]) => void) { /* ... */ }
}
```

## Inference controls

```ts
// const type parameter: infer literal types without callers writing `as const`
function routes<const T extends readonly string[]>(paths: T): T { return paths; }
const r = routes(['/home', '/about']); // readonly ['/home', '/about']

// NoInfer: the default must be one of the given states, not widen the inferred union
function createMachine<S extends string>(states: S[], initial: NoInfer<S>) {}
createMachine(['idle', 'loading'], 'idle');  // OK
createMachine(['idle', 'loading'], 'oops');  // error (without NoInfer, S would widen to include 'oops')
```

## Guidelines

- **Push type parameters down.** Use `T` rather than `T extends any[]` when you only need the element type.
- **Use fewer type parameters.** If `T` appears only once, it isn't relating anything: `function log<T>(x: T): void` should be `function log(x: unknown): void`.
- **Constrain as little as possible**, but enough to use what you need.
- **Avoid returning an unconstrained `T` you didn't receive.** `function parse<T>(s: string): T` is an unchecked cast in disguise. Return `unknown` and validate, or accept a schema.
- **Generic React components** (`<Select<T>>`) keep option and value types connected.

## Pitfalls

- Over-generic, unreadable signatures. Prefer clear overloads or concrete types for simple APIs.
- In `.tsx` files, `<T>(x: T) => x` arrow syntax can parse as JSX. Write `<T,>` or `<T extends unknown>`.
- Constraint vs assignability confusion: `T extends string` can be the literal `'a'`, so returning `''` as `T` is an error.

## In an interview, mention…

- Generics preserve relationships between types. Constraints enable safe member access.
- `K extends keyof T` and indexed access `T[K]` as the bread-and-butter pattern.
- Inference, defaults, `const` type parameters (5.0) and `NoInfer` (5.4).
- Design rules: minimal type parameters, no fake "return T" casts.
