## Approach

Reuse all of `range`'s argument handling, then fill the output from the back.

1. **Normalise:** shift `range(end)` to `start = 0`, and default `step` to `-1` when `end < start`, else `1`.
2. **Length:** `Math.max(Math.ceil((end - start) / (step || 1)), 0)`.
3. **Fill:** for `i` from `0` to `length - 1`, write `start + i * step` at index `length - 1 - i`.

Equivalently, loop over output positions `j` and compute `start + (length - 1 - j) * step`. Both are a single pass with no extra array.

## Why not `range(...).reverse()`?

It would be correct, and in a real codebase that's a perfectly fine one-liner. The prompt forbids it to check that you can reason about the index mapping, which is the same skill as filling any structure from the back. It also saves one O(n) pass and one temporary array, which only matters for very large ranges.

## Why the first value of `rangeRight(0, 10, 3)` is 9

The values are the ones `range` would produce: `0, 3, 6, 9`. `10` is excluded because `end` is exclusive, and the next step after `9` would be `12`. Starting from `end - step = 7` would be wrong, because `7` isn't on the step grid anchored at `start`. The anchor is always `start`, which is why the formula multiplies from `start` rather than subtracting from `end`.

## Complexity

O(n) time and space.

## Edge cases

- `rangeRight(0)` and `rangeRight(3, 3)`: `[]`.
- Wrong-direction step: `[]`.
- Zero step: `[start, start, …]`, the same as `range`.
- Negative ranges: `rangeRight(-4)` is `[-3, -2, -1, 0]`.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Starting from `end - step` | Off the grid when `step` doesn't divide `end - start` (gives `7, 4, 1` instead of `9, 6, 3, 0`) |
| Starting from `end` | Includes the excluded `end` |
| Negating the step and swapping start/end | `rangeRight(0, 10, 3)` becomes `range(10, 0, -3)` = `[10, 7, 4, 1]`, which is wrong |
| Copy-pasting `range` without the one-argument shift | `rangeRight(4)` returns `[]` |

## Follow-ups interviewers ask

- **Shared helper:** extract `normaliseRangeArgs(start, end, step)` returning `{ start, step, length }`, and build both `range` and `rangeRight` on it. That's what a senior candidate should suggest before writing the second function.
- **UI uses:** countdown values, a year picker that lists the newest years first (`rangeRight(1950, currentYear + 1)`), or rendering z-indexed layers back to front.
