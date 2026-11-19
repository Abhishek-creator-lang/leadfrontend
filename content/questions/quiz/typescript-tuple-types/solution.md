## TL;DR

A tuple is an **array type with a fixed (or partially fixed) length and a known type at each position**: `[string, number]`. TypeScript supports **optional elements** (`[string, number?]`), **rest elements** (`[string, ...number[]]`), **labeled elements** (`[name: string, age: number]`, TS 4.0, which improves docs and hovers), **readonly tuples** (`readonly [x: number, y: number]`), and **variadic tuple types** (`[...T, ...U]`, TS 4.0) for typing functions that concatenate, prepend or curry argument lists. Tuples model **function parameter lists**, **hook return pairs** (`[value, setValue]`) and **fixed-shape records**.

## Basics

```ts
type Point = [x: number, y: number];
const p: Point = [10, 20];
p[2];                         // error: tuple of length 2 has no element at index 2

type HttpResult = [status: number, body?: string];
const ok: HttpResult = [204];

type Path = [root: string, ...segments: string[]];
const path: Path = ['home', 'docs', 'ts'];

type Middle = [first: string, ...middle: number[], last: boolean]; // rest in the middle (TS 4.2)
```

## Tuples and functions

Parameter lists *are* tuples:

```ts
function move(x: number, y: number, animate?: boolean) {}
type MoveArgs = Parameters<typeof move>; // [x: number, y: number, animate?: boolean]

function callLater<A extends unknown[]>(fn: (...args: A) => void, ...args: A) {
  setTimeout(() => fn(...args), 0);
}
callLater(move, 1, 2);         // OK
callLater(move, 1, '2');       // error
```

## Variadic tuple types

```ts
function concat<T extends readonly unknown[], U extends readonly unknown[]>(a: T, b: U): [...T, ...U] {
  return [...a, ...b];
}
const r = concat([1, 'a'] as const, [true] as const); // [1, 'a', true]

// Typed partial application
function bindFirst<First, Rest extends unknown[], R>(
  fn: (first: First, ...rest: Rest) => R,
  first: First,
): (...rest: Rest) => R {
  return (...rest) => fn(first, ...rest);
}
const greet = (greeting: string, name: string) => `${greeting}, ${name}`;
const hello = bindFirst(greet, 'Hello'); // (name: string) => string
```

## Returning tuples from hooks

```ts
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn(v => !v), []);
  return [on, toggle] as const; // readonly [boolean, () => void]
}
```

Without `as const` (or an explicit tuple return type), the result is `(boolean | (() => void))[]`, so destructured values lose their specific types.

## Tuple manipulation at the type level

```ts
type Head<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]] ? H : never;
type Tail<T extends readonly unknown[]> = T extends readonly [unknown, ...infer R] ? R : [];
type Length<T extends readonly unknown[]> = T['length']; // a literal number for fixed tuples
```

## Pitfalls

- **Mutable tuples aren't length-safe at runtime:** `p.push(3)` compiles on a non-readonly tuple. Use `readonly` tuples for data.
- **Inference widens to arrays:** `const pair = ['a', 1]` is `(string | number)[]`. Annotate, use `as const`, or use a `const` type parameter.
- **Large tuples** for records hurt readability (what's index 4?). Prefer objects, and use labeled tuples when order is inherent (arguments, coordinates).
- `noUncheckedIndexedAccess` doesn't add `undefined` for known tuple indices, but does for rest elements.

## In an interview, mention…

- Fixed positions and lengths, with optional, rest, labeled and readonly elements.
- Parameter lists as tuples, `Parameters<>`, and variadic tuples for typed `concat` and `bind`.
- `as const` for hook tuple returns.
- Type-level `infer` on tuples, and when to choose objects instead.
