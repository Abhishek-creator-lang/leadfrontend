## Reframing

Removing the fewest intervals is the same as **keeping the most** non-overlapping intervals. The answer is `n - maxKept`. Maximising the kept set is the classic *interval scheduling* problem.

## Brute force

Try every subset, keep the largest one with no overlaps: O(2ⁿ · n). A DP approach (sort by start, then `dp[i] = 1 + max dp[j]` over compatible `j < i`) brings it down to O(n²). That's correct, but still too slow for 10⁵ requests.

## Optimal: greedy by earliest end time

1. Sort a copy of the requests by **end** time.
2. Keep the first one, and remember `lastEnd`.
3. For each next request: if `start >= lastEnd` it fits, so keep it and update `lastEnd`. Otherwise reject it.

**Why earliest end is safe (exchange argument).** Take any optimal schedule. Its first session ends no earlier than the session with the globally earliest end. Swap that first session for ours: nothing later can conflict, because we end at least as early. Repeat for each position. So the greedy schedule keeps as many sessions as the optimum.

**Why other orders fail:**

- *Earliest start:* `[0, 100]` starts first and blocks `[10, 20]` and `[30, 40]`.
- *Shortest first:* `[50, 60]` is shortest but can block both `[0, 55]` and `[55, 100]`.

## Complexity

- **Time:** O(n log n) for the sort; the sweep is O(n).
- **Space:** O(n) for the sorted copy (or O(1) extra if mutating is allowed).

## Edge cases

- Empty input → 0.
- Touching intervals are compatible: use `>=`, not `>`.
- Duplicates: all but one are removed.
- One long interval covering many short ones: the long one is removed.

## Talking through it in an interview

Reframe first ("min removals = n − max kept"). Then name the greedy choice and **justify it**. Interviewers care more about the exchange argument than the six lines of code. Show a counter-example for sorting by start to prove you considered it.

## Follow-ups

- **Weighted version:** greedy breaks. Sort by end and use DP with binary search: `best[i] = max(best[i-1], value[i] + best[p(i)])`, where `p(i)` is the last interval ending at or before `start[i]`. That's O(n log n).
- **k screens:** keep the maximum number of sessions across k parallel rooms by combining a greedy pass with a balanced structure of room end times.
- **Related:** *Meeting Rooms II* asks how many rooms you need to keep **every** session.
