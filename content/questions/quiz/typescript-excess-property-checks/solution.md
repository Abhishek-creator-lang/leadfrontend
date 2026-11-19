## TL;DR

TypeScript is structurally typed, so **extra properties are normally fine**: an object with more fields is assignable to a type that needs fewer. The exception is **excess property checking**: when a **"fresh" object literal** is directly assigned to a typed variable, passed as an argument, or returned from a function with an annotated return type, **unknown properties are an error**. The goal is **catching typos and wrong options** (`{ colour: 'red' }` instead of `color`). Freshness is lost once the literal is stored in a variable without an annotation, which is why the check sometimes "doesn't fire".

## The check in action

```ts
interface ButtonOptions {
  label: string;
  color?: 'blue' | 'red';
  disabled?: boolean;
}

function createButton(opts: ButtonOptions) {}

createButton({ label: 'Save', colour: 'red' });
// error: Object literal may only specify known properties,
// but 'colour' does not exist in type 'ButtonOptions'. Did you mean to write 'color'?
```

Without this check, the typo would compile silently, because all of `ButtonOptions`'s other properties are optional, and the button would render with the default color.

## When it doesn't apply

```ts
const opts = { label: 'Save', colour: 'red' };
createButton(opts); // no error: not fresh, structural assignability only
```

Other cases where it doesn't fire:

- Type assertions: `{ label: 'x', extra: 1 } as ButtonOptions`.
- Spreads of non-literals: in `{ ...base, label: 'x' }`, properties coming from `base` aren't checked.
- Targets with an index signature (`[key: string]: unknown`), which accept any extra keys.
- Generic parameters inferred from the literal (`fn<T>(x: T)`), since `T` becomes the literal's type.

## Unions and discriminants

For union targets, a property is "excess" only if it exists on **none** of the members (and with discriminated unions, TS checks against the matching member):

```ts
type Shape = { kind: 'circle'; radius: number } | { kind: 'square'; size: number };
const s: Shape = { kind: 'circle', radius: 1, size: 2 }; // error: 'size' not in the circle variant
```

## Weak types

A **weak type** has only optional properties. Assigning *any* value that shares **no** properties with it is an error, even if it isn't fresh:

```ts
interface Options { timeout?: number; retries?: number }
const config = { timout: 100 };
const o: Options = config; // error: no properties in common
```

This catches the fully-typo'd case where freshness has already been lost.

## Working with it, not against it

- **Annotate at creation:** `const opts: ButtonOptions = { … }` gets the check where the object is written.
- **`satisfies`:** `const opts = { … } satisfies ButtonOptions` checks excess properties *and* keeps the precise inferred type.
- **Intentional extras:** if a type should accept extra keys, model it (`& Record<string, unknown>`, or an explicit `meta?: Record<string, string>` field) rather than asserting.
- **React props:** passing unknown props to a component in JSX triggers the same check, which is a common source of "Property X does not exist on type IntrinsicAttributes & Props".

## Pitfalls

- Believing types guarantee "no extra keys at runtime". They don't. Objects from APIs or spreads can carry extra properties, so `Object.keys` and serialization may include them. Strip unknown keys with a schema (`.strict()` or `.strip()` in Zod) if it matters, for example before sending data to a server.
- Silencing the error with `as` rather than fixing a typo.

## In an interview, mention…

- Structural typing allows extras, and excess property checks are a targeted exception for fresh literals.
- When freshness is lost (variables, spreads, assertions, index signatures).
- Weak type detection, and how unions are handled.
- `satisfies`/annotations at creation, and runtime stripping when it matters.
