Implement `curry(func)`, which returns a curried version of `func` that also understands a **placeholder**. The placeholder is exposed as `curry.placeholder`. Passing it reserves a position so that a later call can fill it in.

```js
const _ = curry.placeholder;
const join = (a, b, c) => `${a}-${b}-${c}`;
const curried = curry(join);

curried(1, 2, 3);        // '1-2-3'
curried(1)(2)(3);        // '1-2-3'
curried(_, 2)(1, 3);     // '1-2-3'  (1 fills the hole, 3 is appended)
curried(_, _, 3)(1)(2);  // '1-2-3'
curried(_, _, 3)(_, 2)(1); // '1-2-3'
```

## Signature

```js
curry(func: Function): Function
curry.placeholder: symbol
```

## Requirements

- The arity is `func.length`.
- Every call to a curried function takes the arguments collected so far and merges the new ones in:
  1. Each new argument first fills the **earliest unfilled placeholder** (left to right).
  2. New arguments left over once all holes are filled are **appended**.
  3. A new argument may itself be the placeholder, which keeps that hole open (or adds a new one at the end).
- `func` is invoked as soon as the first `func.length` positions all hold non-placeholder values. It receives **every** collected argument, so extra arguments beyond the arity are passed through.
- Otherwise a new curried function is returned. Partially applied functions are **reusable**: calling one twice with different arguments must not leak state between the two calls.
- `this` from the final call is forwarded to `func`.
- If `func.length` is `0`, calling the curried function invokes `func` immediately.

## Follow-up

- How would you let the caller pass an explicit arity (for functions with default or rest parameters)?
- Why is a `Symbol` a better placeholder than `undefined` or a string?
- How does this differ from `partial`, which always invokes `func` on the next call?
