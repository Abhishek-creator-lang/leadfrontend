## TL;DR

An assertion function (TS 3.7+) has a return type of **`asserts condition`** or **`asserts value is T`**. If it **returns normally**, TypeScript **narrows the type for the rest of the scope**. If the condition is false, the function must **throw**. It's the "fail fast" counterpart to a type guard (`value is T`, which returns a boolean you branch on). Use them for **invariants**, **preconditions** and **validating external data at the start of a function**, so the following code stays flat and fully typed.

## Two forms

```ts
// 1. asserts condition: like Node's assert()
function assert(condition: unknown, message = 'Assertion failed'): asserts condition {
  if (!condition) throw new Error(message);
}

function getTotal(order: Order | undefined) {
  assert(order, 'order is required');
  return order.items.length; // order: Order
}

// 2. asserts value is T
function assertIsString(value: unknown, name = 'value'): asserts value is string {
  if (typeof value !== 'string') throw new TypeError(`${name} must be a string`);
}

function greet(input: unknown) {
  assertIsString(input, 'input');
  return input.toUpperCase(); // input: string
}
```

## Compared with type guards

```ts
// Type guard: caller decides what to do
if (isUser(data)) { render(data) } else { showError() }

// Assertion: invalid data is exceptional; just throw
assertIsUser(data);
render(data);
```

Use a **guard** when both outcomes are normal control flow. Use an **assertion** when failure means a bug or corrupted input that should stop execution.

## Practical uses

- **Non-null invariants** after lookups: `assertDefined(map.get(id))`.
- **Exhaustiveness at runtime** combined with `never`.
- **Validating parsed JSON** at API boundaries (often generated from a schema: `schema.parse()` throws and returns typed data, which serves the same purpose).
- **Test helpers:** `assertIsError(err)` before checking `err.message`.
- **DOM queries:**

```ts
function assertElement<T extends Element>(
  el: Element | null,
  ctor: new () => T,
): asserts el is T {
  if (!(el instanceof ctor)) throw new Error(`Expected ${ctor.name}`);
}

const canvas = document.querySelector('#chart');
assertElement(canvas, HTMLCanvasElement);
canvas.getContext('2d');
```

## Rules and gotchas

- **Explicit annotation required at the call site.** Every name in the call target must have an explicit type. An arrow function stored in a `const` whose type is inferred can't be used as an assertion:

```ts
const assertNum = (v: unknown): asserts v is number => { /* ... */ };
assertNum(x); // error TS2775: the variable itself needs an explicit type annotation

type AssertNum = (v: unknown) => asserts v is number;
const assertNum2: AssertNum = v => { if (typeof v !== 'number') throw new Error(); };
assertNum2(x); // OK
```

Declaring it with `function`, or giving the variable an explicit function type, avoids "Assertions require every name in the call target to be declared with an explicit type annotation."
- **The compiler trusts you.** If the implementation doesn't actually throw on bad input, the narrowing is a lie.
- **Can't be `async`.** The narrowing only applies synchronously. `asserts` return types can't be combined with `Promise`.
- **Narrowing scope:** it narrows the variable passed in, but property paths on mutable objects can be invalidated by later assignments.
- **Production behaviour:** don't strip assertions in builds if code relies on them for type safety, unlike `console.assert`, which doesn't throw.

## In an interview, mention…

- `asserts cond` and `asserts x is T` narrow after the call, or throw.
- Assertions vs type guards: exceptional failure vs branching.
- Use cases: invariants, boundary validation (schema `parse`), DOM queries, tests.
- Gotchas: explicit annotation requirement, trusted implementation, synchronous only.
