## Approach

1. Normalise `fromIndex`. Negative values become `length + fromIndex`, then clamp at `0` with `Math.max`.
2. Loop forward from that index. Return the index as soon as `predicate(array[i], i, array)` is truthy.
3. If the loop finishes, return `-1`.

A `fromIndex` beyond the end needs no special code: the loop condition `i < array.length` is false from the start, so you fall through to `-1`.

## Complexity

O(n) predicate calls in the worst case, O(1) extra space. The early return makes the best case O(1).

## Edge cases

- Empty array: `-1`, predicate never called.
- `fromIndex = -100` on a short array: clamped to `0`, so the whole array is searched.
- Sparse arrays: the native `findIndex` visits holes as `undefined` (unlike `forEach` and `filter`, which skip them). A plain index loop does the same.
- The predicate gets the index, which makes "find the first element that differs from its neighbour" possible.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Using `forEach` and trying to `return` from inside it | The `return` exits only the callback; `forEach` can't stop early |
| Returning `undefined` or `null` when nothing matches | Callers check `=== -1` and treat "not found" as found |
| Forgetting to clamp a negative `fromIndex` | `array[-3]` is `undefined`, and the indices you return are negative |
| Using `if (findIndex(...))` at the call site | Index `0` is falsy, so a match at the start looks like "not found" |

## `findIndex` vs `indexOf`

`indexOf` compares with strict equality, so `[NaN].indexOf(NaN)` is `-1`. `findIndex(arr, Number.isNaN)` finds it. `includes` uses SameValueZero and also finds `NaN`, but only tells you whether it's there, not where.

## Follow-ups interviewers ask

- **Repeated lookups:** if you look up items by id many times, build a `Map` from id to index once. Each lookup becomes O(1) instead of O(n). Remember to rebuild it when the array changes.
- **Iteratee shorthands:** lodash also accepts `{ active: true }` (matches), `['active', true]` (matchesProperty) and `'active'` (property). Supporting them means normalising `predicate` into a function first.
- **`findLastIndex`:** search backwards, covered in a separate question.
