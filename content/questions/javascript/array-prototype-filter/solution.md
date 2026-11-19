## Approach

A single loop over indices `0..length-1` that appends the matching elements to a fresh array.

1. Reject `null`/`undefined` receivers, then take `O = Object(this)`.
2. Read `length` once and validate `callbackFn` **before** looping. The native method throws `TypeError` for `[].filter(123)` even though nothing would be visited.
3. For each `k`, check `k in O`. This is what skips holes, and it also skips elements that were deleted during iteration.
4. Read `O[k]` **once** into a local, call `callbackFn.call(thisArg, value, k, O)`, and if the result is truthy, push the value you read. Reading once matters: if the callback mutates `O[k]`, the spec says the original value is kept.

## Complexity

O(n) time, plus whatever the callback costs. O(m) extra space for the m kept elements.

## Edge cases

| Situation | Behaviour |
|---|---|
| Sparse input `[1, , 3]` | callback called twice, result `[1, 3]` (dense) |
| `undefined` stored explicitly `[undefined]` | callback **is** called (`0 in arr` is true) |
| Callback pushes to the array | new elements ignored, because `length` was captured up front |
| Callback deletes a later element | that element is skipped, because `k in O` is false when reached |
| Callback returns `0`, `''`, `NaN` | element excluded (falsy) |
| Callback returns `'no'` or `{}` | element kept (truthy) |
| `thisArg` with an arrow-function callback | ignored, since arrows have lexical `this` |

## Common mistakes

- Iterating with `for...of` or `forEach`-style index loops without `k in O`. Both visit holes as `undefined`.
- Using `this.length` inside the loop condition. Pushing during iteration then causes extra visits, or an infinite loop.
- Passing the result of `callbackFn(...)` through as-is instead of testing its truthiness.
- Forgetting the third `array` argument, or passing the new result array instead of the source.
- Defining the polyfill as an arrow function, which loses `this`.

## Follow-ups

- **In-place filtering:** keep a write pointer `w`. For each kept element do `arr[w++] = arr[k]`, then set `arr.length = w`. It is O(n) time and O(1) extra space, which helps for large arrays in hot paths, but it gives up immutability. In React state, prefer the copying version.
- **Species:** native `filter` builds the result with `ArraySpeciesCreate`, so `class Stack extends Array` gets a `Stack` back. Mention it even if your polyfill returns a plain array.
- **Generic receivers:** because the method only uses `length` and indexed access, `Array.prototype.filter.call(nodeList, ...)` works. Your polyfill does too, since it never assumes `this` is a real array.
