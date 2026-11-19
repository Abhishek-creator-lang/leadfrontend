## TL;DR

**TypeScript types are erased at compile time.** No type information exists at runtime, so a `User` annotation on `await res.json()` **guarantees nothing** about what the server actually sent. TypeScript checks **your code's internal consistency**, not **external data**. At **trust boundaries** (HTTP responses, `localStorage`, URL params, `postMessage`, form input, environment variables, third-party scripts), you need **runtime validation**, ideally with a **schema library** (Zod, Valibot, ArkType, Effect Schema, TypeBox) that **infers the static type from the schema**, so types and checks can't drift. Also relevant: **type stripping** in Node (TypeScript syntax is simply removed and nothing is checked), and the few TS features that *do* emit runtime code (enums, namespaces, parameter properties, decorators).

## The illusion

```ts
interface User { id: string; email: string; createdAt: Date }

async function getUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  return res.json(); // `any` flows into User; nothing checked
}

const u = await getUser('1');
u.createdAt.getTime(); // runtime crash: JSON has a string, not a Date
u.email.toLowerCase(); // crash if the API renamed it to `emailAddress`
```

## Schema-first validation

```ts
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  createdAt: z.coerce.date(),
  role: z.enum(['admin', 'member']).default('member'),
});
type User = z.infer<typeof UserSchema>; // single source of truth

async function getUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return UserSchema.parse(await res.json()); // throws a descriptive error on mismatch
}
```

`safeParse` returns a result object instead of throwing, which is better for form and user input. Validation also **transforms** (coercing dates, applying defaults, stripping unknown keys), so the rest of the app works with clean data.

## Where to validate

- **API responses** at the client boundary (or generate clients and validators from OpenAPI or GraphQL schemas).
- **Forms:** the same schema on client and server (React Hook Form resolvers, Server Actions).
- **Environment variables** at startup (fail fast when `API_URL` is missing).
- **Persisted state** (`localStorage`, IndexedDB), which may come from an older app version, so migrate or validate it.
- **Messages** from iframes, workers and extensions.
- **Server Functions / Actions:** arguments come from the network and are untrusted, even though the call looks like a typed function call.

## Trade-offs

- **Bundle size and CPU:** validators add code and parsing time. Use lighter libraries (Valibot is tree-shakeable), validate once at the boundary, and skip validation of trusted internal data.
- **Strictness:** decide whether to fail hard, log and continue, or degrade gracefully when APIs add or remove fields (tolerant readers).
- **Codegen alternatives:** OpenAPI/GraphQL codegen provides types and sometimes validators, and contract tests catch drift in CI.

## Type stripping and erasure

- Node 22.18+/23.6+ run `.ts` files by **stripping types** with no type-checking. Run `tsc --noEmit` in CI.
- Constructs that need code generation (enums, namespaces with values, parameter properties) aren't strippable. TS 5.8's `--erasableSyntaxOnly` flags them.
- `instanceof` works only with classes (runtime values). Interfaces and type aliases can't be checked at runtime. Use type guards or schemas.

## In an interview, mention…

- Types are erased: compile-time correctness isn't runtime safety.
- Validate at trust boundaries with schema libraries that infer types (one source of truth).
- Specific boundaries: API responses, forms, env vars, storage, `postMessage`, server functions.
- Trade-offs (bundle size, strictness), and type stripping with CI type-checking.
