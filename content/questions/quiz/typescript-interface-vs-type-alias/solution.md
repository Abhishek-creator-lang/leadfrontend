## TL;DR

Both can describe object shapes, and for most object types they're interchangeable. The differences: **interfaces** can be **reopened and merged** (declaration merging), use **`extends`** (with clear errors on conflicting members, and cached relationship checks that can be faster in big codebases), and can only describe object or function shapes. **Type aliases** can name **any type**: unions, intersections, primitives, tuples, mapped and conditional types, template literal types. They're **closed** (no merging). A common team convention is to **use `interface` for object shapes and public APIs that may be extended, and `type` for everything else**. The TypeScript handbook suggests preferring interfaces until you need a type-only feature.

## What only type aliases can do

```ts
type Id = string | number;                         // union
type Point = [x: number, y: number];               // tuple
type Status = `status-${'ok' | 'error'}`;          // template literal
type Readonlyify<T> = { readonly [K in keyof T]: T[K] }; // mapped
type ElementOf<T> = T extends (infer U)[] ? U : never;   // conditional
type Handler = (e: Event) => void;                 // function type (interfaces can do this too, more verbosely)
```

## What only interfaces can do

```ts
interface Window {
  analytics: AnalyticsClient; // merges into the global Window interface
}

interface User { id: string }
interface User { name: string } // merged: { id: string; name: string }
```

Declaration merging is essential for **augmenting globals and third-party modules** (adding to `Window`, Express's `Request`, a theme interface in a styling library). It's also a hazard: two unrelated declarations with the same name silently merge.

## Extending

```ts
interface Animal { name: string }
interface Dog extends Animal { bark(): void }

type Animal2 = { name: string };
type Dog2 = Animal2 & { bark(): void };
```

Differences:

- `extends` **errors** on incompatible overrides (`interface B extends A { name: number }` is an error). An intersection silently produces `never` for a conflicting property.
- The compiler caches interface relationships by name. Large intersections are re-computed, which can slow type-checking and makes error messages and hovers more verbose.
- Interfaces can `extend` type aliases of object types, and classes can `implement` either.

## Other subtle differences

- **Implicit index signatures:** type aliases of object literals are assignable to `Record<string, unknown>`. Interfaces aren't (because they could be merged with more members later). This occasionally surprises people.
- **Display:** hovers show interface names. Aliases may expand into their structure.
- **Recursion:** both support recursive definitions in modern TS.

## Practical guidance

- Pick a convention, enforce it with `@typescript-eslint/consistent-type-definitions`, and don't relitigate it.
- Use `interface` for extendable public contracts (library props, plugin APIs) and when merging is intended.
- Use `type` for unions, discriminated unions, utility compositions, function types, and React props when you compose with unions (`type ButtonProps = LinkProps | NativeButtonProps`).

## In an interview, mention…

- Interfaces merge and use `extends`. Types can express unions, tuples, and mapped and conditional types.
- `extends` error behaviour vs intersection `never`, and the type-check performance note.
- Declaration merging for module and global augmentation.
- Consistency matters more than the choice, so enforce it with lint.
