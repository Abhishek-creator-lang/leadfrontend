## Approach

All of the work is in normalising the two indices. Once you have a clean `[from, to)` range, the loop is trivial.

Write one helper and use it for both indices:

```js
function normalise(index, length) {
  if (index < 0) return Math.max(length + index, 0);
  return Math.min(index, length);
}
```

1. Negative values are converted relative to the end (`length + index`), then clamped at `0`.
2. Non-negative values are clamped at `length`, which is what stops the array from growing.
3. Loop `for (let i = from; i < to; i++) array[i] = value`. If `from >= to` the loop body never runs, so that case needs no branch.

Return `array` itself. Mutating and returning the same reference is the contract of `Array.prototype.fill`, and it allows chaining.

## Complexity

O(end − start) time, O(1) extra space.

## Edge cases

- `start` beyond the length: nothing happens.
- `end` beyond the length: fills to the end, never extends the array.
- `start = -100` on a 4-element array: clamped to `0`.
- Empty array: returned unchanged.
- **Object values are shared.** Every slot receives the same reference. `fill(Array(3), [])` gives three references to one array; pushing into one "row" pushes into all of them. Use `Array.from({ length: 3 }, () => [])` for independent values.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Not clamping `end` to the length | Writes past the end and grows the array |
| Not clamping negative values at `0` | `array[-1] = value` creates a string property `"-1"` instead of an element |
| Treating `-1` as "length" | Off by one: `-1` should exclude only the last element |
| Returning a copy | Breaks the documented contract and any code relying on in-place behaviour |

## Follow-ups interviewers ask

- **Non-mutating variant:** `array.slice()` first, then fill the copy. ES2023 added non-mutating `toSorted`, `toReversed`, `toSpliced` and `with`, but there's no `toFilled`.
- **Non-integer indices:** the native method truncates them with `ToIntegerOrInfinity`. Adding `Math.trunc` in `normalise` covers it.
- **Array-likes:** the native `fill` is generic and works on `{ length: 3 }` via `Array.prototype.fill.call`. Your loop works too, because it only uses `length` and index assignment.
