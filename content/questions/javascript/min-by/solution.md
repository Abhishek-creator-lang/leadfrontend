## Approach

Normalise the iteratee, then do one linear scan:

1. `const getValue = typeof iteratee === 'function' ? iteratee : (el) => el[iteratee]`.
2. Keep `best`, `bestValue` and a `found` flag.
3. For each element compute the value once. Skip `null`, `undefined` and `NaN`.
4. Take the element if nothing has been found yet, or if `value < bestValue`.

Strict `<` keeps the first element on ties. The `found` flag avoids seeding `bestValue` with `Infinity`, which would wrongly exclude an element whose value is exactly `Infinity` and wouldn't work for strings.

`Date` objects work because `<` converts both sides with `valueOf()`, which returns the timestamp. Strings compare by UTF-16 code units, which is not the same as locale-aware alphabetical order (`'Z' < 'a'` is `true`). For user-facing sorting use `localeCompare` or `Intl.Collator` with a comparator-based variant.

## Complexity

O(n) time with exactly n iteratee calls, O(1) extra space.

## Edge cases

- Empty or all-skipped input: `undefined`.
- The answer may itself be falsy (`0`, `''`), so callers must test `=== undefined`, not truthiness.
- `Infinity` is a valid candidate if it's the only value.
- Mixed types (numbers and strings) compare with coercion rules; that's caller error, but worth mentioning.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `bestValue = Infinity` seed with `<` | Never selects an element whose value is `Infinity`; breaks for strings |
| `bestValue = 0` seed | Positive-only inputs return `undefined` |
| Calling the iteratee for both the candidate and the current best each time | 2n calls, and wrong results if the iteratee isn't pure |
| `[...array].sort((a, b) => fn(a) - fn(b))[0]` | O(n log n), fails for non-numbers, and `NaN` makes the comparator inconsistent |

## Follow-ups interviewers ask

- **Min and max together:** process elements in pairs: compare the two to each other, then the smaller with the min and the larger with the max. That's about 3n/2 comparisons instead of 2n.
- **Any iterable:** use `for…of` (already done in the reference solution), so `minBy(map.values(), fn)` works with no change.
- **Comparator version:** `minWith(array, compare)` generalises to multi-key ordering.
