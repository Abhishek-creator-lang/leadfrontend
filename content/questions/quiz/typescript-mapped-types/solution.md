## TL;DR

A mapped type **builds a new object type by iterating over a union of keys**, usually `keyof T`: `{ [K in keyof T]: Transform<T[K]> }`. It can **add or remove modifiers** (`readonly`, `?`) with `+`/`-`, and since TS 4.1 can **remap keys with `as`**, which lets you rename, filter (map to `never`) or derive keys with template literal types. Built-ins such as `Partial`, `Required`, `Readonly`, `Record` and `Pick` are mapped types. Mapped types over a type parameter are **homomorphic**: they preserve the original's modifiers and work element-wise on arrays and tuples.

## Basics

```ts
type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type Mutable<T> = { -readonly [K in keyof T]: T[K] };    // remove readonly
type Concrete<T> = { [K in keyof T]-?: T[K] };           // remove optional (like Required)
type MyRecord<K extends PropertyKey, V> = { [P in K]: V };
```

## Transforming values

```ts
type Flags<T> = { [K in keyof T]: boolean };
type Validators<T> = { [K in keyof T]: (value: T[K]) => string | null };

interface SignupForm { email: string; age: number }
const validators: Validators<SignupForm> = {
  email: v => (v.includes('@') ? null : 'Invalid email'), // v: string
  age: v => (v >= 18 ? null : 'Must be an adult'),        // v: number
};
```

## Key remapping with `as`

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};
type UserGetters = Getters<{ name: string; age: number }>;
// { getName: () => string; getAge: () => number }

// Filtering: keys mapped to never are dropped
type PickByValue<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] };
type StringProps = PickByValue<{ id: number; name: string; email: string }, string>;
// { name: string; email: string }

// Event handler map from an events interface
type Handlers<E> = { [K in keyof E as `on${Capitalize<string & K>}`]?: (payload: E[K]) => void };
```

`string & K` is needed because `keyof T` may include `number | symbol`, which `Capitalize` doesn't accept.

## Homomorphic behaviour

```ts
type Boxed<T> = { [K in keyof T]: { value: T[K] } };
type B = Boxed<[string, number]>; // [{ value: string }, { value: number }] (stays a tuple)
```

Mapping `keyof T` where `T` is a type parameter preserves `readonly`/`?` from the source and maps arrays and tuples element-wise. Mapping over an arbitrary key union (`[K in 'a' | 'b']`) doesn't preserve modifiers.

## Deep variants

```ts
type DeepReadonly<T> =
  T extends (...args: any[]) => any ? T
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;
```

Be careful with functions, `Date`, `Map` and similar types. Recursive mapped types can slow the checker on large models.

## Pitfalls

- `keyof` on a union gives only the **common** keys. Distribute first with a conditional type if you need per-member mapping.
- Index signatures map too (`[key: string]: X` becomes `[key: string]: Transform<X>`), sometimes unexpectedly.
- Overly clever remapping hurts readability and error messages. Name intermediate types.

## In an interview, mention…

- The `[K in Keys]` iteration, with `+`/`-` modifiers.
- `as` remapping for renaming and filtering (via `never`), combined with template literal types.
- Homomorphic mapped types preserve modifiers and tuples.
- How the built-in utilities are implemented, and practical uses (form validators, getters, event handler props).
