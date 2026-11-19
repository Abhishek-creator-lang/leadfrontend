## TL;DR

- **`any`** turns off type checking. Anything is assignable to it, and it's assignable to anything. It's an **escape hatch that spreads unsafety**.
- **`unknown`** is the **type-safe top type**. Anything is assignable to it, but you **can't use it until you narrow it** (with `typeof`, `instanceof`, type guards or validation).
- **`never`** is the **bottom type**, the empty set. **No value has it**. It's the return type of functions that never return (throw or loop forever), the result of impossible narrowing, and the tool for **exhaustiveness checks**.

## any vs unknown

```ts
function parseA(json: string): any { return JSON.parse(json); }
function parseU(json: string): unknown { return JSON.parse(json); }

const a = parseA('{"x":1}');
a.foo.bar();           // compiles, crashes at runtime
const n: number = a;   // compiles: any leaks into typed code

const u = parseU('{"x":1}');
u.x;                   // error: 'u' is of type 'unknown'
if (typeof u === 'object' && u !== null && 'x' in u && typeof u.x === 'number') {
  u.x.toFixed();       // OK after narrowing
}
```

Rule of thumb: **use `unknown` for values whose type you don't know yet** (JSON, `catch` variables, external input, generic containers), and narrow or validate them, ideally with a schema library such as Zod or Valibot. Use `any` only in narrow, commented spots (migrations, typing gaps in libraries), and enable `noImplicitAny` (part of `strict`) so it never appears silently.

`catch (e)` variables are `unknown` under `strict` (via `useUnknownInCatchVariables`, TS 4.4+), so you must narrow them: `if (e instanceof Error) e.message`.

## never

```ts
function fail(message: string): never {
  throw new Error(message);
}

type Shape = { kind: 'circle'; r: number } | { kind: 'square'; size: number };

function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.r ** 2;
    case 'square': return s.size ** 2;
    default: {
      const unreachable: never = s; // error here if a new kind is added and not handled
      return unreachable;
    }
  }
}
```

Other places `never` shows up:

- **Union filtering:** `never` disappears from unions (`string | never` is `string`), which is how `Exclude<T, U>` works: `T extends U ? never : T`.
- **Impossible intersections:** `string & number` is `never`. Objects with conflicting discriminants reduce to `never`.
- **Empty arrays** inferred as `never[]` in some contexts.

## Type-theory view

| Type | Set of values | Assignable from | Assignable to |
|---|---|---|---|
| `unknown` | All values | Everything | Only `unknown` and `any` |
| `any` | Opt-out | Everything | Everything (unsound) |
| `never` | Empty | Only `never` | Everything |

## Pitfalls

- `as any` casts hide real bugs. Prefer `as unknown as T` only when you truly must, or better, validate.
- `Function`, `Object` and `{}` aren't safe "any object" types. `{}` means "any non-nullish value".
- A function inferred to return `never` unexpectedly often signals a bug (an infinite loop, or every path throws).
- ESLint's `@typescript-eslint/no-explicit-any` and `no-unsafe-*` rules help keep `any` out.

## In an interview, mention…

- `any` disables checking and is contagious. `unknown` forces narrowing. `never` is the empty type.
- Use `unknown` for external input with runtime validation, and `catch` variables are `unknown` under strict.
- `never` for exhaustiveness checks and in conditional and utility types.
- Lint and strict settings to limit `any`.
