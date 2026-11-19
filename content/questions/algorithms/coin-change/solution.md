## Why greedy fails

"Take the biggest pack that fits" works for real-world coin systems, but not in general. With packs `[1, 5, 12]` and 15 credits, greedy picks `12 + 1 + 1 + 1` (4 packs) while `5 + 5 + 5` needs 3. Show this counter-example early. It's what justifies the DP.

## Brute force: plain recursion

`best(a) = 1 + min over sizes s ≤ a of best(a - s)`, with `best(0) = 0`. Without caching, the same sub-amounts are recomputed again and again. The branching factor is the number of pack sizes and the depth is up to `amount`, so it's exponential. Even `amount = 100` with three pack sizes never finishes.

## Optimal: bottom-up DP

`dp[a]` = the fewest packs that make exactly `a` credits (`Infinity` if impossible).

1. `dp[0] = 0`; everything else starts at `Infinity`.
2. For `a` from 1 to `amount`, for each size `s ≤ a`: `dp[a] = min(dp[a], dp[a - s] + 1)`.
3. Return `dp[amount]`, or `-1` if it's still `Infinity`.

Why it's correct: any optimal purchase for `a` has a last pack `s`, and what remains must be an optimal purchase for `a - s`. That's **optimal substructure**. Many different purchases share the same remainders. Those are the **overlapping subproblems**, which the table solves once each.

Top-down recursion with a memo `Map` is equally valid and often easier to derive in an interview. Mention that its recursion depth can reach `amount` (10⁴ frames), which is close to the stack limit.

## Complexity

- **Time:** O(amount × k) for k pack sizes: 2 × 10⁵ steps at the limits.
- **Space:** O(amount).

## Edge cases

- `amount = 0` → 0 packs.
- Impossible amounts → `-1` (don't return `Infinity`).
- A single pack size that doesn't divide the amount.
- Pack sizes larger than the amount are simply skipped.

## Talking through it in an interview

1. Offer greedy and break it with a counter-example.
2. Write the recurrence.
3. Point out the overlapping subproblems.
4. Fill the table bottom-up and trace `dp` for a small amount.

This structure maps directly onto how interviewers grade DP questions.

## Follow-ups

- **Return the packs:** store `choice[a] = s` whenever `dp[a]` improves, then walk back from `amount`.
- **Count combinations** (order doesn't matter): `ways[0] = 1`, and loop over sizes in the **outer** loop and amounts in the inner loop, `ways[a] += ways[a - s]`. Swapping the loops counts ordered sequences instead, which is a classic follow-up trap.
- **Limited stock per pack size:** this becomes a bounded knapsack.
