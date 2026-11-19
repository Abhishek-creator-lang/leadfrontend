## Approach

Return a closure over `fns`. When it is called:

1. If `fns` is empty, return the first argument (identity).
2. Call the last function with all arguments: `fns[fns.length - 1].apply(this, args)`.
3. Walk the remaining functions from right to left, feeding each result into the next with `fn.call(this, result)`.

A `for` loop that counts down is the clearest version. A one-liner with `reduceRight` also works, but it needs special handling for the multi-argument first step:

```js
const compose = (...fns) => (...args) =>
  fns.reduceRight((acc, fn, i) => (i === fns.length - 1 ? fn(...acc) : fn(acc)), args);
```

The classic Redux version, `fns.reduce((f, g) => (...args) => f(g(...args)))`, builds a nested chain of closures once at compose time. That is elegant, but it adds one stack frame per function and gives worse stack traces.

## Complexity

Composing is O(1), apart from copying `fns`. Each call is O(n) for n functions, with O(1) extra space for the loop version.

## Edge cases

- **No functions:** identity on the first argument, so `compose()(1, 2)` returns `1`.
- **One function:** behaves exactly like that function, including multiple arguments.
- **`this`:** the composed function must be a regular `function` so that `obj.method = compose(...)` works.
- **Reuse:** nothing is stored between calls, so calling the composed function twice gives independent results.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Iterating left to right | This is `pipe`, not `compose` |
| Passing only `args[0]` to the rightmost function | Multi-argument entry points break |
| Calling the functions inside `compose` itself | Side effects run too early, and only once |
| Using arrow functions throughout | `this` is lost when the result is used as a method |

## Follow-ups

- **`pipe`:** `pipe(...fns) === compose(...fns.reverse())`. Copy before reversing so you do not mutate the caller's array.
- **Async composition:** start from `Promise.resolve(value)` and chain `.then(fn)` for each function, or `await` inside the loop.
- **Redux:** `applyMiddleware` composes `next => action => …` wrappers, so the first middleware listed is the outermost and runs first.
- **Validation:** throwing a `TypeError` at compose time for non-function arguments surfaces mistakes earlier than failing on the first call.
