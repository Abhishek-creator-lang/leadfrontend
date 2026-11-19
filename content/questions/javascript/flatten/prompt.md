Implement `flatten(array, depth)`. It returns a **new** array in which nested arrays are spread into their parent, up to `depth` levels deep. With no `depth`, flatten **completely**.

```js
flatten([1, [2, [3, [4]], 5]]);    // [1, 2, 3, 4, 5]
flatten([1, [2, [3, [4]], 5]], 1); // [1, 2, [3, [4]], 5]
flatten([1, [2, [3, [4]], 5]], 2); // [1, 2, 3, [4], 5]
flatten([[], [[]], 1]);            // [1]
```

## Signature

```js
flatten(array, depth = Infinity)
```

## Requirements

- `depth` defaults to `Infinity` (full flatten). `depth = 0` returns a shallow copy.
- Element order is preserved.
- Only real arrays (`Array.isArray`) are flattened. Strings, array-like objects (`{ length: 1, 0: 'x' }`) and other iterables are kept as single elements.
- **Holes** in sparse arrays are skipped (as `Array.prototype.flat` does). Explicit `undefined` and `null` elements are kept.
- Never mutate the input.
- Do **not** use `Array.prototype.flat`.
- Your solution should not overflow the call stack for arrays nested thousands of levels deep (an interviewer may ask for a **non-recursive** version).

## Follow-up

- Write both a recursive and an iterative version. What are the trade-offs?
- How would you flatten lazily with a generator?
- What happens with a self-containing array (`a.push(a)`)?
