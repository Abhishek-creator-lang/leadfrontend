## TL;DR

A discriminated (tagged) union is a **union of object types that share a literal-typed property**, the **discriminant** (`kind`, `type`, `status`). Checking that property (`switch (x.kind)`) **narrows** the value to the matching member, so you can safely access that member's fields. They model **states and messages precisely**, making **impossible states unrepresentable**. **Exhaustiveness checking**, by assigning the leftover value to `never` in `default` (or using `satisfies never`), makes the compiler **flag every switch you forgot to update** when a new variant is added.

## Modelling state

```ts
// Bad: everything optional, invalid combinations possible
type RequestStateLoose = { loading: boolean; data?: User; error?: Error };

// Good: one variant per state
type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: Error };

function render(state: RequestState) {
  switch (state.status) {
    case 'idle': return 'Start a search';
    case 'loading': return 'Loading…';
    case 'success': return `Hello ${state.data.name}`; // data available only here
    case 'error': return state.error.message;
  }
}
```

## Exhaustiveness

```ts
function assertNever(value: never, message = 'Unhandled variant'): never {
  throw new Error(`${message}: ${JSON.stringify(value)}`);
}

function label(state: RequestState): string {
  switch (state.status) {
    case 'idle': return 'Idle';
    case 'loading': return 'Loading';
    case 'success': return 'Done';
    case 'error': return 'Failed';
    default: return assertNever(state); // compile error if a status is missing
  }
}
```

Add `{ status: 'cancelled' }` to the union and every `switch` using `assertNever` fails to compile until it's handled. The runtime throw also protects against unexpected data from outside your types (an API sending a new status).

Alternatives:

- `default: state satisfies never;` (TS 4.9+), a compile-time-only check.
- With `strict` and an explicit return type, a missing case also errors with "Function lacks ending return statement".
- A `Record<RequestState['status'], …>` lookup table is exhaustive by construction.
- ESLint's `@typescript-eslint/switch-exhaustiveness-check`.

## Narrowing details

- The discriminant must be a **literal type** (string, number, boolean, `undefined`/`null` literals). `kind: string` won't narrow.
- Narrowing works with `switch`, `if`/`else` and `===`. It also works with aliased conditions (TS 4.4: `const ok = state.status === 'success'; if (ok) state.data`) and with destructured discriminants (TS 4.6: `const { status, data } = action`, then `if (status === 'success')` narrows `data`).
- `in` checks narrow untagged unions too (`'data' in state`), but tags are clearer.
- Unions can have **multiple discriminants**, and nested unions compose (e.g. `event.type` then `event.payload.kind`).

## Use cases

- Async request state, form wizards and finite state machines.
- Redux and `useReducer` actions: `{ type: 'added'; item } | { type: 'removed'; id }`.
- API responses (`{ ok: true; value } | { ok: false; error }`, a Result type).
- React props for mutually exclusive variants (`{ variant: 'link'; href } | { variant: 'button'; onClick }`).

## Pitfalls

- Narrowing is lost inside callbacks if the variable is reassignable (`let`), or after awaits for properties of mutable objects. Copy to a `const`.
- Spreading or partially updating can produce objects that don't match any variant. Construct whole variants.
- Overly large unions are hard to read. Group them, or use generics for shared shapes.

## In an interview, mention…

- A literal discriminant plus narrowing makes impossible states unrepresentable.
- `assertNever` / `satisfies never` for exhaustiveness, with a runtime guard for external data.
- Reducer actions and Result types as common applications.
- Narrowing caveats (literal discriminants, mutation, closures).
