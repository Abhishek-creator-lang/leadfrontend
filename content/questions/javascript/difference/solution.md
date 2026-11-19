## Approach

Put every excluded value in a `Set`, then filter `array` with `set.has`:

1. `const excluded = new Set(others.flat())`. Each value from the exclusion arrays goes into one set. (A nested loop that adds each array's items avoids the intermediate array, and is what the reference solution does.)
2. `array.filter((value) => !excluded.has(value))`.

`Set` uses SameValueZero, which is exactly the rule the prompt asks for: `NaN` finds `NaN`, `-0` finds `0`, and objects compare by reference. That's why `Set` is better here than `indexOf`, which uses strict equality and can never find `NaN`.

## Complexity

With n = `array.length` and m = total length of `others`:

- **Set version:** O(n + m) average time, O(m) extra space.
- **Naive `includes` version:** O(n × m) time, O(1) extra space.

For tiny inputs (say, under ~10 exclusions) the naive version can be faster in practice because it avoids hashing and allocation. lodash itself switches strategy based on size. Mentioning that trade-off is a senior-level signal.

## Edge cases

- No `others` returns a shallow copy of `array`.
- Duplicates in `array` survive when they aren't excluded: `[1, 1, 2]` minus `[2]` is `[1, 1]`.
- Duplicates in `others` don't matter.
- Two structurally equal objects `{ id: 1 }` are different values, so they don't exclude each other.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Using `indexOf` for membership | `NaN` can never be excluded |
| Building a `Set` of `array` and diffing sets | Drops duplicates from the result |
| Only handling the first exclusion array | `difference(a, b, c)` ignores `c` |
| Rebuilding `new Set(values)` inside the filter callback | Back to O(n × m), plus a lot of garbage |

## Follow-ups interviewers ask

- **`differenceBy` / `differenceWith`:** build the set from `iteratee(value)` and test `iteratee(element)`. With a custom comparator (`differenceWith`) you lose hashing and are back to O(n × m).
- **Native set methods:** ES2025 adds `Set.prototype.difference`. It returns a `Set`, so it drops duplicates and isn't a drop-in replacement for this function.
- **Symmetric difference:** the elements in exactly one of two arrays. Two sets, two filters.
