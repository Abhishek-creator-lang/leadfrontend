## How many are there?

n distinct items have n! orderings, and each one has length n, so **any** algorithm must do at least O(n · n!) work just to write the output. "Optimal" here means not wasting work beyond that.

## Brute force

Generate all nⁿ sequences of length n (each position picks any item), then keep those with no repeated item. For n = 8 that's 16.7 million candidates to filter down to 40,320. It's correct, but about 400 times more work than necessary.

## Optimal: backtracking with a "used" array (reference)

Build the permutation one position at a time:

```
choose(path):
  if path.length === n: record a copy of path
  for each item i not yet used:
    mark i used; path.push(items[i])
    choose(path)
    path.pop(); unmark i        ← backtrack
```

Every branch of the recursion tree ends in a valid permutation, so nothing is wasted. Copy `path` (`path.slice()`) when recording it. Pushing the live array would leave you with n! references to one array that ends up empty.

**Alternative: swap-based.** Fix position `k` by swapping each of `a[k..n-1]` into it, recurse on `k + 1`, then swap back. It needs no `used` array, but it mutates a working copy, and its output order isn't lexicographic.

## Complexity

- **Time:** O(n · n!). There are n! leaves and each copy is O(n). Internal nodes add a constant factor (Σ n!/k! ≤ e · n!).
- **Space:** O(n) recursion and path, plus O(n · n!) for the output.

## Edge cases

- Empty input → `[[]]`. There is exactly one way to order nothing, and the base case handles it automatically.
- One item.
- Items that are objects: permutations contain the same references, which is fine.
- Don't mutate the input. The `used` approach never touches it.

## Talking through it in an interview

Draw the recursion tree for three items: three branches, then two, then one. Write the choose/explore/un-choose template. The same template solves *Subsets* and *Combination Sum*, so naming it is valuable. State the n! complexity up front so the interviewer knows you understand why n is capped at 8.

## Follow-ups

- **Duplicates in the input:** sort first, then skip `items[i]` if it equals `items[i - 1]` and `items[i - 1]` is **not** currently used. That ensures equal values are always placed in a fixed relative order.
- **Next permutation:** find the rightmost `i` with `a[i] < a[i + 1]`, swap `a[i]` with the rightmost element greater than it, then reverse the suffix after `i`. That's O(n) per step, useful for iterating without storing everything.
- **Generators:** a `function*` that `yield`s each permutation lets callers stop early without allocating all n! arrays.
