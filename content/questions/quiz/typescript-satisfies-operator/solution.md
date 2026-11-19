## TL;DR

`expr satisfies Type` (TS 4.9+) **checks that an expression conforms to a type without changing the expression's inferred type**. Compare that with a **type annotation** (`const x: Type = …`), which **widens** the variable to `Type` and loses specific information, and a **type assertion** (`as Type`), which **skips checking** and can lie. `satisfies` gives you **validation plus precise inference**: literal keys, specific value types, and excess-property errors, all at once.

## The problem it solves

```ts
type Color = string | [number, number, number];
type Palette = Record<'primary' | 'secondary' | 'accent', Color>;

// Annotation: validated, but every value is now `Color`
const p1: Palette = { primary: '#0af', secondary: [0, 128, 255], accent: '#f60' };
p1.primary.toUpperCase();   // error: Color might be a tuple

// Assertion: no real checking, so missing keys slip through
const p2 = { primary: '#0af' } as Palette; // compiles, but secondary and accent are undefined at runtime

// satisfies: checked AND precise
const p3 = {
  primary: '#0af',
  secondary: [0, 128, 255],
  accent: '#f60',
} satisfies Palette;

p3.primary.toUpperCase();   // OK: string
p3.secondary[0].toFixed();  // OK: number tuple
```

With `satisfies`, a missing key, an unknown key (excess property check) or a wrong value type is a compile error, but the variable keeps its literal-ish inferred type.

## Common uses

**Config objects with known keys**

```ts
const routes = {
  home: '/',
  user: '/users/:id',
} satisfies Record<string, `/${string}`>;

type RouteName = keyof typeof routes; // 'home' | 'user' (an annotation would give `string`)
```

**With `as const` for literal, readonly data**

```ts
const themes = ['light', 'dark'] as const satisfies readonly string[];
type Theme = (typeof themes)[number]; // 'light' | 'dark'
```

**Exhaustive maps**

```ts
type Status = 'idle' | 'loading' | 'error';
const statusLabel = {
  idle: 'Waiting',
  loading: 'Loading…',
  error: 'Failed',
} satisfies Record<Status, string>; // adding a Status forces adding a label
```

**Exhaustiveness in switches**: `default: value satisfies never`.

**Framework configs**: `export default { … } satisfies Config` gives editor completion and checking without losing inference.

## When to use which

| Goal | Use |
|---|---|
| The variable's type should be the declared contract (e.g. it may later hold other values) | Annotation `: T` |
| Validate shape but keep precise inferred types | `satisfies T` |
| You know better than the compiler (rare, e.g. DOM APIs) | `as T` (prefer narrowing) |

## Pitfalls

- `satisfies` doesn't change the type, so if you *want* widening (a mutable variable you'll reassign to other `Color`s), use an annotation.
- Contextual typing still applies: `satisfies` can influence inference of literals (e.g. tuples vs arrays) because the target type provides context.
- It's a TS 4.9+ feature, so older toolchains (old Babel or ESLint parsers) may not parse it.

## In an interview, mention…

- Annotation widens, assertion bypasses checks, `satisfies` validates and preserves inference.
- Excess property checks apply, unlike with `as`.
- Typical uses: config objects, exhaustive `Record` maps, `as const satisfies`.
- Choosing an annotation when you actually want the wider contract type.
