## TL;DR

A conditional type `T extends U ? X : Y` **chooses a type based on assignability**, like a ternary at the type level. Inside the `extends` clause, **`infer R` declares a type variable that TypeScript fills in by pattern-matching**, so you can **extract** parts of a type: a function's return type, a promise's resolved value, an array's element type, or a segment of a string literal. When `T` is a **naked type parameter**, conditional types **distribute over unions**. Many built-in utilities (`ReturnType`, `Parameters`, `Awaited`, `Exclude`, `NonNullable`) are conditional types.

## Basics

```ts
type IsString<T> = T extends string ? true : false;
type A = IsString<'hi'>;  // true
type B = IsString<42>;    // false
```

## Extracting with infer

```ts
type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;
type ElementType<T> = T extends readonly (infer E)[] ? E : T;
type PromiseValue<T> = T extends Promise<infer V> ? V : T;

type R1 = MyReturnType<() => Date>;       // Date
type E1 = ElementType<string[]>;           // string
type P1 = PromiseValue<Promise<number>>;   // number
```

`infer` with a constraint (TS 4.7+) narrows what's captured:

```ts
type FirstString<T> = T extends [infer S extends string, ...unknown[]] ? S : never;
type F = FirstString<['a', 1]>; // 'a'
```

Template literal pattern matching:

```ts
type RouteParams<P extends string> =
  P extends `${string}:${infer Param}/${infer Rest}`
    ? Param | RouteParams<`/${Rest}`>
    : P extends `${string}:${infer Param}`
      ? Param
      : never;

type Params = RouteParams<'/users/:userId/posts/:postId'>; // 'userId' | 'postId'
```

## Distribution

```ts
type ToArray<T> = T extends unknown ? T[] : never;
type D = ToArray<string | number>; // string[] | number[] (distributed)

type ToArrayND<T> = [T] extends [unknown] ? T[] : never;
type ND = ToArrayND<string | number>; // (string | number)[] (wrapping in a tuple prevents distribution)
```

Distribution is why `Exclude<'a' | 'b' | 'c', 'a'>` gives `'b' | 'c'`. Note that `never` distributes to `never`: `IsString<never>` is `never`, not `false`. Wrap it in a tuple if you need to detect `never`.

## Real-world uses

- Deriving types from functions: `type Props = Parameters<typeof createUser>[0]`.
- Unwrapping API clients: `Awaited<ReturnType<typeof api.getUser>>`.
- Building typed routers, event emitters, and form libraries.
- Recursive types (`DeepPartial`, `Awaited`'s recursive unwrapping of nested thenables).

## Pitfalls

- **Readability:** deeply nested conditionals are hard to maintain. Name intermediate types and add tests (`expectTypeOf`, `// @ts-expect-error` checks).
- **Deferred evaluation:** when `T` is an unresolved generic, the conditional stays unevaluated inside a function body, so `return` statements often need casts. Overloads can be cleaner.
- **Recursion limits:** very deep recursion hits "Type instantiation is excessively deep". Tail-recursive patterns (TS 4.5+) help.
- **Multiple `infer` candidates:** inferring from overloaded functions uses the **last** overload signature.

## In an interview, mention…

- `T extends U ? X : Y` as type-level branching, and `infer` as pattern matching.
- Distribution over naked type parameters, and the `[T]` trick to disable it.
- How built-ins such as `ReturnType`, `Awaited` and `Exclude` are implemented.
- Maintainability: name pieces, write type tests, and keep it sane.
