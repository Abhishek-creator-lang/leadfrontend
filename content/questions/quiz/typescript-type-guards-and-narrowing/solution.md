## TL;DR

**Narrowing** is TypeScript's **control-flow analysis**: after a runtime check, the compiler refines a variable's type within that branch. The built-in narrowing checks are **`typeof`**, **`instanceof`**, **`in`**, **equality and truthiness**, **discriminant property checks**, and **`Array.isArray`**. When those aren't enough, write a **user-defined type guard**: a function returning **`value is T`**. Since **TS 5.5**, TypeScript can **infer** type predicates from simple functions (so `arr.filter(x => x !== undefined)` finally narrows). **Assertion functions** (`asserts value is T`) narrow by throwing instead of returning a boolean.

## Built-in narrowing

```ts
function format(input: string | number | Date | null | undefined) {
  if (input == null) return '';                     // null and undefined
  if (typeof input === 'string') return input.trim(); // string
  if (typeof input === 'number') return input.toFixed(2);
  return input.toISOString();                       // Date (only option left)
}

type Fish = { swim(): void };
type Bird = { fly(): void };
function move(a: Fish | Bird) {
  if ('swim' in a) a.swim(); else a.fly();
}

function handle(err: unknown) {
  if (err instanceof Error) console.error(err.message);
}
```

Gotchas: `typeof null === 'object'`, and truthiness checks drop `0`, `''` and `NaN` along with null and undefined. Use `!= null` when zero or empty strings are valid.

## User-defined type guards

```ts
interface User { id: string; name: string }

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value && typeof value.id === 'string' &&
    'name' in value && typeof value.name === 'string'
  );
}

const data: unknown = await res.json();
if (isUser(data)) data.name; // User
```

**The compiler trusts your predicate.** A wrong implementation is an unchecked cast. For complex external data, derive guards from a schema (Zod's `safeParse`, Valibot), so types and validation can't drift.

`this is T` guards work on class methods (`isLeaf(): this is LeafNode`).

## Inferred type predicates (TS 5.5)

```ts
const ids = [1, undefined, 3].filter(x => x !== undefined);
// TS 5.5+: number[]   (previously (number | undefined)[])
```

TypeScript infers `x is number` when the function returns a boolean expression that narrows its parameter and the "false" case also implies the negation. Truthiness-based filters (`filter(Boolean)` or `x => !!x`) are **not** inferred as predicates, because `0` would be excluded, so the "false" branch doesn't mean "not a number".

## Assertion functions

```ts
function assertIsDefined<T>(v: T, msg?: string): asserts v is NonNullable<T> {
  if (v == null) throw new Error(msg ?? 'Expected value to be defined');
}
const el = document.getElementById('root');
assertIsDefined(el);
el.append('ready'); // HTMLElement
```

Assertion functions must be called through an explicitly typed reference (not an inferred arrow function stored in a `const` without an annotation).

## Where narrowing is lost

- **Inside callbacks** for `let` variables or object properties that could have changed. Copy to a `const` first. (TS 5.4 preserves narrowing in closures created after the last assignment.)
- **After function calls**, narrowing of mutable object properties is kept optimistically. TS doesn't invalidate it, which can be unsound.
- **Across `await`**, the same caveats apply for shared mutable state.

## In an interview, mention…

- Control-flow narrowing with `typeof`, `instanceof`, `in`, equality and discriminants.
- `value is T` predicates are trusted, so pair them with real validation (schemas).
- TS 5.5 inferred predicates (`filter`), and why `filter(Boolean)` isn't inferred.
- Assertion functions, and where narrowing gets lost (callbacks, mutable state).
