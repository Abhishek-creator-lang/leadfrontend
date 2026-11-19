## TL;DR

A **type annotation** (`const x: User = value`) **asks the compiler to check** that `value` is assignable to `User`, and errors if it isn't. A **type assertion** (`value as User`, or the older `<User>value`) **tells the compiler to treat a value as a type**, *overriding* inference with **only a minimal sanity check** (the types must overlap). Assertions compile to nothing and do no runtime checking, so a wrong assertion becomes a runtime bug. **Prefer annotations, `satisfies` and narrowing**, and reserve assertions for cases where you genuinely know more than the compiler (DOM queries, after validation, test fixtures). The **non-null assertion** `x!` and **double assertions** (`as unknown as T`) are the riskiest variants.

## Side by side

```ts
interface User { id: string; name: string }

const a: User = { id: '1' };            // error: property 'name' is missing
const b = { id: '1' } as User;          // compiles: assertion silences it
b.name.toUpperCase();                   // runtime TypeError

const c = { id: '1', name: 'Ada', admin: true } satisfies User; // error: excess property 'admin'
```

| | Checks assignability | Changes resulting type | Runtime effect |
|---|---|---|---|
| Annotation `: T` | Yes (strict, with excess property checks) | Widens the variable to `T` | None |
| `satisfies T` | Yes | No (keeps inferred type) | None |
| Assertion `as T` | Only "sufficient overlap" | Yes, to `T` | None |

## Legitimate assertions

```ts
// DOM: you know which element the id refers to
const canvas = document.getElementById('chart') as HTMLCanvasElement;
// Safer: check at runtime
const el = document.getElementById('chart');
if (!(el instanceof HTMLCanvasElement)) throw new Error('chart canvas missing');

// After validation you've already done
const data = JSON.parse(raw) as unknown;  // widening to unknown is always safe
const user = UserSchema.parse(data);      // a schema returns a typed value, no assertion needed

// Literal narrowing
const method = 'GET' as const;
```

## Non-null assertion `!`

```ts
const root = document.getElementById('root')!; // "trust me, it's not null"
```

It removes `null | undefined` from the type. It's acceptable when it's truly guaranteed (an element in your own HTML template). Otherwise prefer `?.`, an explicit check, or an assertion function that throws a clear error. ESLint's `no-non-null-assertion` flags it.

## Double assertion

```ts
const n = 'hello' as unknown as number; // compiles; total lie
```

TypeScript blocks `'hello' as number` because the types don't overlap. Going through `unknown` bypasses even that. Reserve it for test doubles or interop shims, and leave a comment.

## Better alternatives

- **Narrowing** with `typeof`, `instanceof`, `in` and discriminants.
- **Type guards / assertion functions** that check at runtime.
- **Schema validation** (Zod, Valibot) at trust boundaries: network, storage, `postMessage`.
- **Generics** with proper constraints instead of `as T` returns.
- **`satisfies`** to validate object literals without widening.

## Pitfalls

- `fetch(...).then(r => r.json() as Promise<User>)`: an assertion masquerading as typing. The API can return anything. Validate it.
- `{} as Props` in tests hides missing props. Build complete fixtures, or use `Partial` with factories.
- Angle-bracket syntax `<T>x` doesn't work in `.tsx` files. Use `as`.

## In an interview, mention…

- Annotations check, and assertions override with minimal checking and no runtime effect.
- `satisfies` as the middle ground, and `as const` as a special, safe assertion.
- The risks of `!` and `as unknown as T`, and the lint rules that limit them.
- Validate at boundaries instead of asserting.
