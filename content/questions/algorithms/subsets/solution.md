## How many are there?

Each of the n items is either in or out, so there are 2ⁿ subsets with an average size of n/2. Writing the output alone costs O(n · 2ⁿ). That's the lower bound, and every approach below meets it.

## Brute force (what not to do)

Generate all permutations and de-duplicate them as sets, or build candidates of every length by repeated nested loops and filter. These do far more than 2ⁿ work (permutations alone are n!).

## Approach 1: backtracking (include / exclude)

For each index `i`, branch twice: skip `items[i]`, or include it. When `i === n`, record a copy of the current path.

A common variant records the path at **every** node and loops forward from a `start` index:

```
explore(start):
  record copy of path
  for i from start to n-1:
    path.push(items[i]); explore(i + 1); path.pop()
```

This version extends naturally to "subsets of size k" and to skipping duplicates.

## Approach 2: iterative doubling (reference)

Start with `[[]]`. For each item, append a copy of every existing subset with the item added. After processing k items you have 2ᵏ subsets. No recursion, and very easy to explain.

## Approach 3: bitmasks

For `mask` from 0 to 2ⁿ − 1, bit `i` of `mask` says whether `items[i]` is included. It's compact and maps nicely to feature flags, but with n > 30 JavaScript's 32-bit bitwise operators break. That doesn't apply here, but it's worth mentioning.

## Complexity

- **Time:** O(n · 2ⁿ).
- **Space:** O(n · 2ⁿ) for the output; O(n) auxiliary for the recursive version.

## Edge cases

- Empty input → `[[]]`.
- Single item → `[[], [x]]`.
- Always push **copies**, never the live path array.

## Talking through it in an interview

State the 2ⁿ count first, then pick the approach you can code bug-free. Iterative doubling is the safest. Mention backtracking, because the follow-ups (duplicates, size k) are easiest with it, and mention bitmasks to show breadth.

## Follow-ups

- **Duplicates:** sort the items. In the "loop from `start`" backtracking, skip `items[i]` when `i > start` and `items[i] === items[i - 1]`.
- **Size k only** (combinations): stop recursing once `path.length === k`. That's C(n, k) results.
- **Testing reality check:** 16 flags means 65,536 configurations, far too many to run end to end. Mention **pairwise (all-pairs) testing**, which covers every pair of flag values with a few dozen configurations.
