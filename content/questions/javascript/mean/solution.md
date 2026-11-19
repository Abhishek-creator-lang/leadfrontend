## Approach

Sum the values with a loop (or `reduce` with an initial value of `0`), then divide by `array.length`.

```js
const sum = array.reduce((total, n) => total + n, 0);
return sum / array.length;
```

The empty case needs no branch: the sum is `0`, the length is `0`, and `0 / 0` is `NaN`, which is the specified result. Still, writing `if (array.length === 0) return NaN` makes the intent explicit for the next reader, and the reference solution does that.

## Complexity

O(n) time, O(1) extra space.

## Floating-point notes

- `mean([0.1, 0.2, 0.3])` is `0.20000000000000004` because none of those decimals has an exact binary representation. For display, format with `toFixed` or `Intl.NumberFormat`; for money, work in integer cents.
- Summing very large and very small numbers together loses precision. Kahan (compensated) summation reduces that error; mention it if the interviewer pushes on numerics.
- A sum of very large values can overflow to `Infinity` even when the mean would be finite. The running-mean formula below avoids that.

## Edge cases

- Empty array: `NaN`.
- A `NaN` element propagates to the result. Silently skipping it would hide bad data.
- One element: that element.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `reduce` without an initial value | Throws a `TypeError` on an empty array |
| Returning `0` for an empty array | Indistinguishable from a real average of zero |
| `Math.round` or `toFixed` inside the function | Returns a string or loses precision; formatting is the caller's job |
| Sorting or mutating the input to "clean" it | Side effects on the caller's data |

## Follow-ups interviewers ask

- **Running mean:** keep `count` and `avg`. For each new value `x`: `count++; avg += (x - avg) / count`. O(1) memory, numerically stable, and no overflow from a huge sum.
- **Median and percentiles:** the mean is sensitive to outliers. For latency, report p50/p75/p95 (Core Web Vitals uses the 75th percentile).
- **`meanBy(array, iteratee)`:** map with the iteratee inside the loop rather than creating an intermediate array.
