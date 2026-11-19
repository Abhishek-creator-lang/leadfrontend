## TL;DR

When a conditional type checks a **naked type parameter** (`T extends U ? X : Y`) and is instantiated with a **union**, TypeScript **applies the condition to each union member separately and unions the results**. That's **distribution**. It's why `Exclude<'a' | 'b', 'a'>` yields `'b'`, and why `ToArray<string | number>` gives `string[] | number[]`. To **disable** distribution, wrap both sides in a tuple: `[T] extends [U] ? X : Y`. Gotcha: **`never` is the empty union**, so a distributive conditional over `never` returns `never` without evaluating either branch.

## Distribution in action

```ts
type ToArray<T> = T extends unknown ? T[] : never;

type A = ToArray<string | number>;
// = ToArray<string> | ToArray<number>
// = string[] | number[]
```

The built-ins rely on it:

```ts
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
type NonNullable<T> = T & {}; // (modern definition; earlier: T extends null | undefined ? never : T)

type Status = 'idle' | 'loading' | 'error';
type NotIdle = Exclude<Status, 'idle'>; // 'loading' | 'error'
```

`never` disappears from unions, so mapping a member to `never` filters it out.

## What counts as "naked"

```ts
type Naked<T> = T extends string ? 'yes' : 'no';           // distributes
type Wrapped<T> = [T] extends [string] ? 'yes' : 'no';     // doesn't
type InArray<T> = T[] extends string[] ? 'yes' : 'no';     // doesn't

type N = Naked<string | number>;   // 'yes' | 'no'
type W = Wrapped<string | number>; // 'no'
```

Only a bare type parameter in the **checked** position triggers distribution, and only when it's instantiated with a union.

## Disabling distribution deliberately

```ts
type IsUnion<T, C = T> = T extends unknown ? ([C] extends [T] ? false : true) : never;
type U1 = IsUnion<'a' | 'b'>; // true
type U2 = IsUnion<'a'>;       // false
```

This uses distribution (over `T`) and non-distribution (`[C]`) together: for each member `T`, it asks whether the whole union `C` fits into that one member.

## The never trap

```ts
type IsString<T> = T extends string ? true : false;
type X = IsString<never>; // never (not false, not true)

type IsNever<T> = [T] extends [never] ? true : false;
type Y = IsNever<never>;  // true
```

`never` distributes over zero members, so you get `never`. Always use the tuple form to detect `never`.

## Distribution with object unions

```ts
type Shape = { kind: 'circle'; r: number } | { kind: 'square'; s: number };

// Non-distributive Omit loses variant-specific keys:
type Bad = Omit<Shape, 'kind'>; // {} (only common keys survive)

// Distributive version keeps each variant:
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type Good = DistributiveOmit<Shape, 'kind'>; // { r: number } | { s: number }
```

This is a common fix for React props that are discriminated unions wrapped by HOCs or `Omit`.

## Pitfalls

- **Unexpected expansion:** `boolean` is `true | false`, so `Fn<boolean>` distributes into two results.
- **Performance:** distributing over large unions (hundreds of members) multiplies work.
- **Hidden in helpers:** a type like `Foo<T> = T extends any ? …` distributes even if the author meant "always true". Name the intent.

## In an interview, mention…

- Naked type parameter plus union instantiation means per-member evaluation unioned back together.
- `Exclude`/`Extract` as examples, and `never` filtering.
- `[T] extends [U]` to disable it, and `IsNever` as the canonical example.
- `DistributiveOmit` for discriminated-union props, and the `boolean` gotcha.
