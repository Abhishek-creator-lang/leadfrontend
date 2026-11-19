## Approach

Handle the argument shapes first, then do a single comparison:

1. **Two-argument form.** If `end === undefined`, the caller meant `inRange(number, end)`. Shift: `end = start; start = 0`.
2. **Swapped bounds.** If `start > end`, swap them (destructuring makes this one line: `[start, end] = [end, start]`).
3. **Check.** `return number >= start && number < end`.

Checking `end === undefined` (rather than `arguments.length === 2`) also covers callers that explicitly pass `undefined`, which is what lodash does too.

## Why half-open ranges?

Half-open `[start, end)` ranges compose without gaps or overlaps: `[0, 10)` and `[10, 20)` cover every number from 0 to 20 exactly once. The length is simply `end - start`, and an empty range is `start === end`. That's why `slice`, `substring`, `range` and most bucketing code use them. Use a closed range when the end is a meaningful value that must be included, such as "pages 1 to 5".

## Complexity

O(1) time and space.

## Edge cases

- `start === end`: always `false`.
- `NaN` for `number` or a bound: every comparison is `false`, so the result is `false`.
- Negative ranges and decimals work without special handling.
- `inRange(0, -0, 1)` is `true` because `0 >= -0`.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Using `<= end` | `inRange(4, 2, 4)` returns `true` |
| Default parameter `start = 0` in the signature | Doesn't help: in `inRange(4, 8)` the `8` lands in `start`, not `end` |
| Swapping only the values used in the comparison, but forgetting the two-argument shift first | `inRange(4, 8)` checks `[8, undefined)` and returns `false` |
| Using `Math.min`/`Math.max` with an `undefined` end | `Math.max(8, undefined)` is `NaN`, so everything is `false` |

## Follow-ups interviewers ask

- **No swap:** `return number >= Math.min(start, end) && number < Math.max(start, end)`. It's the same logic, but some people find it clearer.
- **Closed or open on both ends:** take an `inclusivity` option like `'[)'`, `'[]'`, `'()'`, which is what date libraries such as date-fns or Day.js do for `isBetween`.
- **Validation:** decide whether non-numeric inputs should throw. lodash coerces them with `toNumber`; a typed codebase would reject them at compile time.
