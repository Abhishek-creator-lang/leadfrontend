## Brute force

Recursively try **every** size at every step until the sum reaches or passes the target, and collect ordered sequences. That generates `[4, 8]` and `[8, 4]` separately, so you'd then need to sort each result and de-duplicate with a `Set`. It does a lot of wasted work, because each multiset is produced once per distinct ordering.

## Optimal: backtracking with a start index

Generate each multiset **in non-decreasing order** of the sizes, so it can only be produced once:

1. Sort a copy of `sizes` ascending.
2. `explore(start, remaining)`:
   - if `remaining === 0`, record a copy of `path`;
   - for `i` from `start` to the end:
     - if `sizes[i] > remaining`, **break**, since every later size is larger too (this pruning is why we sort);
     - push `sizes[i]`, then call `explore(i, remaining - sizes[i])`, passing **`i`, not `i + 1`**, so the same size can be reused;
     - pop.

Passing `i` allows reuse, and never going back below `start` prevents permutations of the same combination.

## Complexity

The output can be exponential in `target / min(size)`, so no algorithm is polynomial in general. The backtracking tree has roughly O(k^(T/m)) nodes for k sizes, target T and smallest size m. Each recorded combination costs O(T/m) to copy. The sort plus `break` cuts the tree substantially in practice.

- **Space:** O(T/m) recursion depth, plus the output.

## Edge cases

- `target = 0` → `[[]]`, one empty combination.
- No combination exists → `[]`.
- Sizes given unsorted.
- A size larger than the target is simply never used.

## Talking through it in an interview

Start from the permutation-style search, point out the duplicates, then fix them by enforcing an order (the `start` index). That's the single idea that separates combinations from permutations. Then add the `break` pruning and explain why it needs sorted input.

## Follow-ups

- **Each size at most once, with duplicates in the input:** recurse with `i + 1`, and skip `sizes[i]` when `i > start && sizes[i] === sizes[i - 1]`.
- **Count only:** unbounded-knapsack DP. `ways[0] = 1`; for each size (outer loop), for `a` from size to target, `ways[a] += ways[a - size]`. That's O(k · T). Putting sizes in the outer loop is what counts *combinations* rather than ordered sequences.
- **Fewest pieces:** see *Coin Change*.
