A growth dashboard records the **net change in active users** for each day (sign-ups minus churn). Product wants to highlight the best streak: the run of consecutive days with the largest total gain.

Write `maxSubarraySum(changes)`, which returns the largest possible sum of a **non-empty contiguous** run of `changes`.

```js
maxSubarraySum([3, -5, 4, -1, 2, 1, -6, 2]); // 6   (4 - 1 + 2 + 1)
maxSubarraySum([-8, -3, -6]);                // -3  (the least bad single day)
maxSubarraySum([5]);                         // 5
maxSubarraySum([2, 3, -1, 4]);               // 8   (the whole array)
```

## Constraints

- `1 ≤ changes.length ≤ 10⁵`.
- The run must contain **at least one** day, so an all-negative array returns its largest element, not 0.
- Aim for O(n) time and O(1) extra space.

## Follow-up

- Return the start and end day of the best streak too.
- What if the dashboard's timeline wraps around (a circular array)?
