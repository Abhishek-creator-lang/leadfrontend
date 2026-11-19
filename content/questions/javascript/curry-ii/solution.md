## Approach

Treat the collected arguments as an **immutable list** that lives in a closure. Each partial application captures its own list, and every call builds a *new* list by merging in the incoming arguments. Because nothing is mutated, `const g = curried(_, 2)` can be called many times without the calls interfering.

The merge step:

1. Walk the previously collected arguments. When a slot holds the placeholder and there are still unused incoming arguments, take the next incoming one. Otherwise keep the slot as it is.
2. Append any incoming arguments that are left.
3. The function is *ready* when there are at least `func.length` collected values and none of the first `func.length` is the placeholder.

If it is ready, call `func.apply(this, merged)`. If not, return `make(merged)`, a fresh curried function bound to the new list.

Incoming placeholders need no special handling. They fill a hole with another hole, which keeps that position open, exactly as required.

## Complexity

Each call is O(k) time and space, where k is the number of arguments collected so far, because the list is copied on every call. k is bounded by the arity plus extras, so this is effectively constant for real-world functions.

## Edge cases

- **Zero arity:** `merged.length >= 0` and the empty `every` are both true, so the first call invokes `func`.
- **Extra arguments:** they are appended and passed through to `func`. That matters for variadic code that reads `arguments`.
- **`this`:** the returned function is a regular `function`, and only the final call's `this` is used.
- **Placeholders beyond the arity** (for example `curried(1, 2, 3, _)`) are not checked by the readiness test; `func` receives the placeholder in that slot. lodash behaves the same way, and it is worth mentioning.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Pushing into one shared `args` array | Reusing a partial application leaks arguments from previous calls |
| Counting `args.length >= arity` without checking for placeholders | `curried(_, _, 3)` fires immediately with holes |
| Filling holes from right to left, or appending before filling | Arguments end up in the wrong positions |
| Using an arrow function for the curried function | `this` cannot be forwarded |
| Using `undefined` as the placeholder | You can no longer pass `undefined` as a real argument |

## Follow-ups

- **Explicit arity:** `curry(func, arity = func.length)`. `func.length` ignores parameters with defaults and rest parameters, so `(a, b = 1) => {}` has length 1.
- **Placeholder identity:** lodash lets each curried function carry its own placeholder (`curried.placeholder`) so that custom builds still work. A unique `Symbol` guarantees it cannot collide with user data.
- **Curry vs partial:** `partial` binds some arguments and *always* calls on the next invocation. Curry keeps returning functions until the arity is satisfied.
- **Debuggability:** heavily curried code produces anonymous stack frames. Setting `name` on the returned function helps.
