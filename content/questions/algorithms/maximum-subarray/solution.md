## Brute force

Try every start `i`, extend the end `j` while keeping a running sum, and track the best. That's O(n²), around 5 × 10⁹ steps at 10⁵ days. The naive triple loop that re-sums each range is O(n³).

A divide-and-conquer solution (best of left half, right half, or a run crossing the middle) gives O(n log n). It's worth mentioning, but there's something simpler and faster.

## Optimal: Kadane's algorithm

Define `endingHere` = the best sum of a run that **ends at the current day**. For each new value `x` there are only two choices:

- extend the previous run: `endingHere + x`
- start fresh at today: `x`

So `endingHere = max(x, endingHere + x)`. In words: **if the run so far is negative, drop it**, because it can only drag future days down. The answer is the maximum `endingHere` over all days.

Initialise both `endingHere` and `best` with the **first element**, not 0. Starting at 0 silently allows an empty run and returns 0 for all-negative input, which is the most common bug.

This is dynamic programming with an O(1) state: `dp[i] = max(a[i], dp[i-1] + a[i])`, and only `dp[i-1]` is ever needed.

## Complexity

- **Time:** O(n), one pass.
- **Space:** O(1).

## Edge cases

- All negative → the largest single element.
- Single element.
- The whole array is the best run.
- Zeros: they don't change the sum; either choice is fine.

## Talking through it in an interview

Phrase it as "what's the best run that ends exactly here?". Once that question is posed, the recurrence is one line. Trace the example, showing where the run resets (after `3, -5`, the running sum is negative, so drop it). Call out the all-negative edge case before the interviewer does.

## Follow-ups

- **Return the range:** track `start` (set to `i` whenever you restart) and record `bestStart`/`bestEnd` whenever `best` improves.
- **Circular array:** the answer is either the normal Kadane result or `total − (minimum subarray sum)`, which "wraps around". If every number is negative, use the normal result.
- **2D version** (the best rectangle in a heatmap): fix a pair of rows, collapse the columns into a 1D array of sums, run Kadane. O(rows² × cols).
- **Related:** *Best Time to Buy and Sell Stock* is Kadane over the day-to-day price differences.
