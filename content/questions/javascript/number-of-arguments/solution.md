## Approach

Two idiomatic answers:

```js
// Modern: rest parameters give a real array.
function numberOfArguments(...args) {
  return args.length;
}

// Legacy: every non-arrow function has an `arguments` object.
function numberOfArguments() {
  return arguments.length;
}
```

Both count arguments that were actually **passed**, so an explicit `undefined` counts while a missing argument does not. Prefer rest parameters in modern code. They are real arrays, they work in arrow functions, and they make the intent visible in the signature.

## Three different "lengths"

| Expression | Meaning |
|---|---|
| `args.length` / `arguments.length` | How many arguments **this call** received |
| `fn.length` | How many parameters the function **declares** before the first default or rest parameter |
| `fn.toString()` parsing | Don't. It breaks under minification |

`function numberOfArguments(...args)` has `length === 0`, because rest parameters are not counted. `((a, b = 2, ...rest) => {}).length` is `1`, because counting stops at the first parameter with a default.

## Complexity

O(1). The engine already knows how many arguments were passed.

## Edge cases

- `fn(undefined)` is 1, and `fn()` is 0.
- Spreading a sparse array `[1, , 3]` produces three arguments; the hole becomes `undefined`.
- `fn.apply(null, arrayLike)` accepts any array-like, so `fn.apply(null, { length: 2 })` passes two `undefined`s and returns 2.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Using `arguments` inside an arrow function | It refers to the enclosing function's `arguments`, or throws a ReferenceError at module top level |
| Counting non-`undefined` values | Explicit `undefined` arguments are miscounted |
| Returning `numberOfArguments.length` | Always the declared parameter count, never the call count |
| `arguments.map(...)` | `arguments` is not an array, so there is no `map`; use `Array.from(arguments)` or rest parameters |

## Follow-ups

- **Why no `arguments` in arrows:** arrow functions do not bind their own `this`, `arguments`, `super` or `new.target`; they close over the enclosing ones.
- **Strict mode:** in sloppy mode with simple parameters, `arguments[0]` and the first parameter are aliased (writing one updates the other). Strict mode and modules remove that link, which is one reason engines optimise strict code better.
- **Where `fn.length` matters:** `curry` uses it to decide when enough arguments have arrived, and older test frameworks used it to detect whether a test accepted a `done` callback.
