## Approach 1: recursion (start here in an interview)

Walk the array. For each element, if it's an array and there is depth left, recurse with `depth - 1` and append the results; otherwise append the element.

```js
function flatten(array, depth = Infinity) {
  const result = [];
  array.forEach((item) => {
    if (Array.isArray(item) && depth > 0) result.push(...flatten(item, depth - 1));
    else result.push(item);
  });
  return result;
}
```

It's short and easy to reason about. Two weaknesses: each level allocates an intermediate array, and the recursion depth equals the nesting depth, so a few thousand levels can throw `RangeError: Maximum call stack size exceeded`. (`push(...big)` also has an argument-count limit for very large sub-arrays; passing the shared `result` down avoids both the copying and that limit.)

## Approach 2: explicit stack (the reference solution)

Replace the call stack with an array of **frames** `{ items, index, depthLeft }`. Each loop iteration looks at the top frame:

- If its index is past the end, pop it (the sub-array is done).
- Otherwise read the next element. If it's an array with depth remaining, push a new frame for it. Otherwise append it to the result.

Because we always resume the most recently opened sub-array first, output order matches the recursive version, with no need to reverse anything at the end.

A common alternative is "pop from the end, push children, reverse at the end": `stack = [...array]; while (stack.length) { const x = stack.pop(); Array.isArray(x) ? stack.push(...x) : result.push(x); } result.reverse()`. It's neat for full flattening, but it's awkward to support `depth`, and it handles holes differently.

## Complexity

O(n) time, where n is the total number of elements across all levels, and O(n) output space. The extra space is O(d) frames for nesting depth d, but on the heap, not the call stack.

## Edge cases

- **`depth = 0`** returns a shallow copy (nested arrays are kept by reference).
- **Holes:** `i in frame.items` is `false` for holes, so they're skipped, matching `Array.prototype.flat`. `forEach` in the recursive version also skips holes. Explicit `undefined` is a real element and is kept.
- **Array-likes and strings** aren't flattened; `Array.isArray` is the right test (`instanceof Array` fails across iframes).
- **Self-containing arrays** (`a.push(a)`) loop forever with `depth = Infinity`. Track visited arrays in a `Set` if that's possible in your data.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `typeof item === 'object'` as the array check | Flattens plain objects or crashes on `null` |
| Forgetting to decrement `depth` | Depth argument ignored |
| `result = result.concat(flatten(item))` in a loop | O(n²) copying on wide arrays |
| `reduce` with `acc.concat(...)` | Same quadratic copying, plus a new array per element |
| Using `arr.toString().split(',')` | Turns numbers into strings, breaks on commas inside strings, loses objects |

## Follow-ups interviewers ask

- **Generator:** `function* flat(arr, d) { for (const x of arr) Array.isArray(x) && d > 0 ? yield* flat(x, d - 1) : yield x; }`. Lazy, so you can stop early (`take(10)`), but `yield*` is recursive too.
- **`flatMap`:** mapping then flattening one level, which is `flatten(arr.map(fn), 1)`.
- **Flatten a nested object** into dotted keys: see `squash-object`.
- **Why native `flat` defaults to depth 1** while lodash has `flatten` (1), `flattenDeep` (∞) and `flattenDepth` (n): full flattening is rarely what you want on real data, and depth 1 is cheap and predictable.
