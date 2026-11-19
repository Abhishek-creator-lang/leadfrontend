## Approach

Flattening is a depth-first walk. The spec describes it as a recursive helper, **FlattenIntoArray**, and that is the clearest way to write it:

```
flattenInto(target, source, depth):
  for each index k of source that exists (k in source):
    element = source[k]
    if depth > 0 and Array.isArray(element):
      flattenInto(target, element, depth - 1)
    else:
      target.push(element)
```

The public method converts `depth`, then calls the helper with `Object(this)` as the source and a fresh array as the target.

### Converting `depth`

- `undefined` means `1`. This is different from a missing number elsewhere in the language, where `undefined` usually becomes `NaN` and then `0`.
- Anything else goes through **ToIntegerOrInfinity**, so `'2'` becomes `2`, `1.9` becomes `1`, `NaN` becomes `0`, and `Infinity` stays `Infinity`.
- Negative depths behave like `0`. The `depth > 0` check handles that without extra code.
- `Infinity - 1` is still `Infinity`, so full flattening needs no special case.

## Complexity

O(N) time, where N is the total number of slots across all arrays visited. Space is O(N) for the output plus O(d) recursion depth, where d is the nesting depth actually reached.

## Edge cases

- **Holes vanish.** Because the helper only visits `k in source`, `[1, , 2].flat(0)` is `[1, 2]`. People often assume `flat(0)` is an exact copy, and it isn't.
- **Explicit `undefined` stays:** `[undefined].flat()` is `[undefined]`.
- **Array-likes are not flattened.** `flat` checks `IsArray` only. Unlike `concat`, it ignores `Symbol.isConcatSpreadable`.
- **Cycles:** `const a = [1]; a.push(a); a.flat(Infinity)` recurses forever, natively too, until a `RangeError`. Mention it if the interviewer asks about robustness.

## Iterative version (no recursion limit)

Use an explicit stack of `[array, index, depth]` frames, or the simpler "pop from the end, then reverse" trick for the unlimited-depth case:

```js
function flatDeep(input) {
  const stack = [...input]; // note: spread turns holes into undefined
  const out = [];
  while (stack.length) {
    const item = stack.pop();
    if (Array.isArray(item)) stack.push(...item);
    else out.push(item);
  }
  return out.reverse();
}
```

This version is fine for interviews, but it converts holes to `undefined` and pushes huge arrays onto the stack in one call. Name both caveats. A frame-based stack that tracks depth handles everything exactly.

## Common mistakes

- **Defaulting with `depth = depth || 1`.** That turns `0` into `1`.
- **Using `reduce` + `concat` recursively.** It works, but each `concat` copies the accumulator, which is O(N²) for wide arrays. Pushing into one shared target is linear.
- **Flattening strings or array-likes** by checking `length` instead of `Array.isArray`.
- **Decrementing depth for non-array elements**, or checking depth after recursing instead of before.

## Follow-ups

- **`flatMap(fn)`** is `map` followed by `flat(1)`, done in one pass: for each element, call `fn` and, if the result is an array, push its elements. Otherwise push the result. It is limited to one level so that a callback returning nested arrays (for example tuples) is not over-flattened, and so it can be implemented efficiently.
- **Generators:** a lazy `function* flatten(arr, depth)` with `yield*` lets you stream huge structures without allocating the full result.
