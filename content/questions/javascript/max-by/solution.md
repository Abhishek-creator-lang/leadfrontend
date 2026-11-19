## Approach

A single linear scan that tracks two things: the best element so far and its computed value.

1. Start with `best = undefined` and `bestValue = undefined`.
2. For each element, compute `value = iteratee(element)`.
3. Skip it if `value == null` or `Number.isNaN(value)`.
4. Replace the best if nothing has been chosen yet, or if `value > bestValue`.

Using `>` (strictly greater) means a later element with the same value doesn't replace the earlier one, so the first one wins ties. Storing `bestValue` avoids calling the iteratee twice per element, which matters when it's expensive or has side effects.

Track "nothing chosen yet" with a separate flag (or check `bestValue === undefined`, which is safe here because `undefined` values are skipped). Don't seed `bestValue` with `-Infinity`: an element whose value is `-Infinity` would then never be selected, and non-number values (strings, dates) wouldn't compare correctly against it.

## Complexity

O(n) time, one iteratee call per element, O(1) extra space.

## Why not `Math.max(...array.map(fn))`?

- It returns the **value**, not the element; finding the element again needs a second scan.
- Spreading a very large array can exceed the engine's argument limit and throw a `RangeError`.
- One `NaN` makes the whole result `NaN`, and `null` is coerced to `0`.
- It only works for numbers; `maxBy` with `>` also works for strings and `Date`s.

## Edge cases

- Empty array or all values skipped: `undefined`.
- Ties: first element wins.
- Negative values and `-Infinity` are valid candidates.
- Strings compare lexicographically with `>`, so `maxBy(words, (w) => w)` returns the alphabetically last word.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Initialising with `bestValue = 0` | An array of negative numbers returns `undefined` |
| Using `>=` | Last element wins ties instead of the first |
| `array.sort(...)[last]` | O(n log n) and mutates the caller's array |
| Not skipping `NaN` | `NaN > x` is always false, but a leading `NaN` as the first best blocks every later comparison |

## Follow-ups interviewers ask

- **Top k:** keep a min-heap of size k for O(n log k), or sort a copy for small inputs.
- **Custom comparators:** accept `compare(a, b)` instead of an iteratee to support multi-field ranking (price, then rating).
- **Reduce version:** `array.reduce(...)` works but recomputes the iteratee for the accumulator unless you carry `[element, value]` pairs. The loop is clearer.
