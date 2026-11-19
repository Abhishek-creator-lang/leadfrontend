A web-vitals report shows the **k-th slowest** page load in a sample (for example, the 50th slowest out of 10,000 loads, which approximates the p99.5). Write `kthLargest(values, k)`, which returns the `k`-th largest value in `values`, where `k = 1` is the maximum.

Duplicates count separately: in `[5, 5, 3]` the 1st and 2nd largest are both `5`.

```js
kthLargest([1200, 340, 980, 4100, 760], 1); // 4100
kthLargest([1200, 340, 980, 4100, 760], 2); // 1200
kthLargest([5, 5, 3], 2);                   // 5
kthLargest([7], 1);                         // 7
kthLargest([3, -1, 2], 3);                  // -1
```

## Requirements

- `1 ≤ k ≤ values.length`.
- **Don't mutate `values`.** The report reuses the array.

## Constraints

- Up to 10⁵ values.
- Sorting is O(n log n) and acceptable as a first answer. Aim for **O(n log k)** (a heap) or **O(n) on average** (quickselect).
- Inputs may be already sorted or full of duplicates. Make sure your approach doesn't degrade to O(n²) on them.

## Follow-up

- The values arrive as a stream and the report must always show the current k-th largest. What do you keep in memory?
- How would you compute an exact median of a huge dataset that doesn't fit in memory?
