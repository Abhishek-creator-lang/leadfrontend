## Approach

1. **Validate eagerly.** Loop over `fns` once and throw a `TypeError` naming the bad position. Validating at creation time means a typo in a pipeline that is built at module load fails on startup, not deep inside a user interaction.
2. **Return a regular function** so that `this` can be forwarded.
3. When it is called with no functions, return `args[0]`. Otherwise run `fns[0].apply(this, args)` and then reduce over the rest with `fn.call(this, acc)`.

```js
let result = fns[0].apply(this, args);
for (let i = 1; i < fns.length; i++) result = fns[i].call(this, result);
```

## Complexity

O(n) to validate when the pipeline is created, O(n) per call, and O(1) extra space.

## Edge cases

- **Empty pipeline:** identity on the first argument.
- **Multi-argument entry:** only the first step sees all arguments. Every step after that returns exactly one value, so later functions receive exactly one argument.
- **Non-function values** such as `undefined` (a common result of a typo in an import) throw a `TypeError` immediately.
- **`this`:** forwarded to every step, which allows a pipeline to be used as an object method.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `fns.reduce((acc, fn) => fn(acc), args)` | The first function receives an array instead of spread arguments |
| Right-to-left iteration | This is `compose` |
| Validating lazily inside the returned function | Errors appear far from the cause |
| Mutating `fns` (for example with `reverse()`) | Building a second pipeline from the same array behaves differently |

## Follow-ups

- **Async pipe:** `async function (...args) { let r = await fns[0].apply(this, args); for (...) r = await fns[i].call(this, r); return r; }`. Each step may then be sync or async.
- **`tap`:** `const tap = (fn) => (x) => (fn(x), x);`, which is handy for logging inside a pipeline.
- **Relation:** `pipe(...fns)` equals `compose(...[...fns].reverse())`. The difference is purely the reading order.
- **TypeScript:** typing a variadic `pipe` precisely needs overloads or recursive conditional types, which is why libraries ship overloads for up to around ten steps.
