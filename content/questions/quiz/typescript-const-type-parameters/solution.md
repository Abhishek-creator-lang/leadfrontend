## TL;DR

A **`const` type parameter** (TS 5.0), written `function f<const T>(x: T)`, tells TypeScript to **infer `T` as if the caller had written `as const`** on the argument: **literal types are preserved** (`'GET'`, not `string`), and **array literals become readonly tuples**. It moves the burden from **callers** (who forget `as const`) to the **library author**, which is ideal for APIs that build types from configuration: routers, state machines, schema builders, typed event names, and SQL/query builders.

## Before TS 5.0

```ts
function defineRoutes<T extends readonly string[]>(routes: T) { return routes; }

const a = defineRoutes(['/home', '/about']);
// T = string[]  (literals lost)

const b = defineRoutes(['/home', '/about'] as const);
// T = readonly ['/home', '/about']  (only if the caller remembers `as const`)
```

## With `const`

```ts
function defineRoutes<const T extends readonly string[]>(routes: T) { return routes; }

const r = defineRoutes(['/home', '/about']);
// T = readonly ['/home', '/about']

type Route = (typeof r)[number]; // '/home' | '/about'
```

For objects:

```ts
function createMachine<const Config extends { initial: string; states: Record<string, unknown> }>(
  config: Config,
) {
  return config;
}

const m = createMachine({
  initial: 'idle',
  states: { idle: {}, loading: {}, done: {} },
});
// m.initial: 'idle'; keyof typeof m.states: 'idle' | 'loading' | 'done'
```

## The readonly constraint gotcha

```ts
function bad<const T extends string[]>(x: T) { return x; }
bad(['a', 'b']); // T = string[]: the const inference produced a readonly tuple, which doesn't satisfy the mutable constraint, so TS falls back
```

Constrain with **`readonly unknown[]`** (or `readonly string[]`) so the inferred readonly tuple fits.

## What it does and doesn't do

- It only affects **inference from literal expressions written at the call site**. Passing a variable that's already widened (`const arr = ['a']; f(arr)`) keeps `string[]`.
- It doesn't make the value immutable at runtime or require `readonly` in your implementation.
- It works on functions, methods and classes' type parameters (`class Registry<const T>`), but not on type aliases or interfaces.
- It applies in the same contexts where `as const` would narrow: string, number and boolean literals, array literals and object literals.

## Related tools

- `satisfies` validates a value against a type while keeping inference, from the caller's side.
- `NoInfer<T>` (TS 5.4) stops an argument from contributing to inference, e.g. a default value that must be one of the inferred literals.
- `as const` is still useful for standalone constants that aren't passed through a function.

```ts
function createFSM<const S extends string>(states: readonly S[], initial: NoInfer<S>) {}
createFSM(['idle', 'running'], 'idle');    // OK
createFSM(['idle', 'running'], 'paused');  // error
```

## In an interview, mention…

- `<const T>` gives `as const`-style inference without caller ceremony (TS 5.0).
- Use cases: config-driven APIs (routes, machines, schemas, event maps).
- The `readonly` constraint gotcha, and that it only applies to literals at the call site.
- How it combines with `NoInfer` and `satisfies`.
