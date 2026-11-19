## Why greedy fails

Two tempting greedy strategies are both wrong:

- **"Every other slot"** (even vs odd indices): `[5, 1, 1, 5]` → evens give 6, odds give 6, but slots 0 and 3 give 10.
- **"Biggest first, then block its neighbours":** `[8, 9, 8]` → taking 9 blocks both 8s and gives 9, while 8 + 8 = 16.

## Brute force

Recursively decide for each slot: skip it, or fill it and skip the next one. That's a binary tree of depth n, so O(2ⁿ) without caching. Forty slots is already about 10¹² calls.

## Optimal: DP on "best up to slot i"

Let `best(i)` = the maximum revenue using slots `0..i`. For slot `i` there are two options:

- **Skip it:** `best(i - 1)`.
- **Fill it:** `revenue[i] + best(i - 2)`, since the neighbour `i - 1` must stay empty.

```
best(i) = max(best(i - 1), revenue[i] + best(i - 2))
```

Only the last two values are needed, so keep two rolling variables:

```js
let prev2 = 0, prev1 = 0;     // best(i-2), best(i-1)
for (const r of revenue) [prev2, prev1] = [prev1, Math.max(prev1, r + prev2)];
return prev1;
```

Starting both at 0 handles the empty and single-slot cases naturally.

## Complexity

- **Time:** O(n).
- **Space:** O(1) (O(n) if you keep the full table to reconstruct the choice).

## Edge cases

- Empty → 0; one slot → its value; two slots → the larger.
- Zeros anywhere.
- Gaps of more than one skipped slot can be optimal (`[5, 1, 1, 5]`). The DP allows this automatically because "skip" carries `best(i - 1)` forward.

## Talking through it in an interview

Break both greedy ideas with small counter-examples, then frame the decision at slot `i` as "take it or leave it". Write the recurrence, then compress to two variables. Trace `[2, 7, 9, 3, 1]` in a table: `2, 7, 11, 11, 12`.

## Follow-ups

- **Which slots:** keep the full `best` array, then walk backwards. If `best[i] === best[i - 1]`, slot i was skipped; otherwise it was taken, so jump to `i - 2`.
- **Circular carousel:** the first and last slots can't both be filled. Run the linear DP twice, on `[0..n-2]` and on `[1..n-1]`, and take the max. Handle n = 1 separately.
- **Tree-shaped layout** (no parent and child both filled): a post-order DFS returning `[bestWithNode, bestWithoutNode]` for each subtree.
