## Approach

The loop itself is simple. The interview signal is in how you **choose the starting accumulator**.

1. Reject `null`/`undefined` receivers, take `O = Object(this)`, read `length`, and check that `callbackFn` is a function.
2. Detect whether an initial value was supplied with `arguments.length >= 2`. Do **not** use `initialValue !== undefined`, because `[1].reduce(fn, undefined)` is a legitimate call that should pass `undefined` as the first accumulator.
3. If no initial value was given, scan forward for the first index `k` with `k in O`. That element becomes the accumulator and the loop continues at `k + 1`. If you run off the end, throw `TypeError('Reduce of empty array with no initial value')`.
4. For each remaining index that exists, run `acc = callbackFn(acc, O[k], k, O)`.
5. Return `acc`.

`callbackFn` is called with `this` set to `undefined`. Unlike `map`/`filter`, `reduce` has no `thisArg` parameter, because the second argument is already taken by `initialValue`.

## Complexity

O(n) time plus the callback's cost. O(1) extra space, not counting whatever the accumulator itself grows to.

## Edge cases

| Input | Result |
|---|---|
| `[].reduce(f, init)` | `init`, `f` never called |
| `[x].reduce(f)` | `x`, `f` never called |
| `[].reduce(f)` | `TypeError` |
| `[, , ].reduce(f)` | `TypeError` (no element exists) |
| `[, , 5, 6].reduce(f)` | first call is `f(5, 6, 3, arr)` |
| `[1].reduce(f, undefined)` | `f(undefined, 1, 0, arr)` |

## Common mistakes

- **`if (initialValue === undefined)`** to detect a missing initial value. It breaks for an explicit `undefined`. A rest parameter (`(...args) => args.length`) works too.
- **Starting at index 1 unconditionally** when there is no initial value. For `[, 5, 6]` that would use the hole at index 0 as the accumulator.
- **Forgetting the TypeError** and returning `undefined` for an empty array.
- **Not skipping holes**, which feeds `undefined` into arithmetic and produces `NaN`.

## Why style guides prefer an explicit initial value

Without one, the accumulator's type depends on the data. `[].reduce(sum)` throws, and `[{ price: 2 }].reduce((a, b) => a + b.price)` returns the object itself because the callback never runs. Always passing an initial value keeps the type stable and makes empty arrays safe.

## Follow-ups

```js
const map = (arr, fn) => arr.reduce((acc, x, i) => (acc.push(fn(x, i)), acc), []);
const filter = (arr, fn) => arr.reduce((acc, x, i) => (fn(x, i) ? (acc.push(x), acc) : acc), []);
```

Push into the accumulator rather than returning `[...acc, x]`. The spread version copies the array on every step and is O(n²).

Other things interviewers ask about:

- **`reduceRight`** is the same algorithm iterating from `length - 1` down to `0`. It is handy for function composition (`compose`).
- **Async reduce:** `arr.reduce((p, x) => p.then(() => task(x)), Promise.resolve())` runs promises in series.
- **Readability:** for a sum, `reduce` is idiomatic. For building complex objects, a plain `for...of` loop is often clearer, and a lead engineer should be comfortable saying so.
