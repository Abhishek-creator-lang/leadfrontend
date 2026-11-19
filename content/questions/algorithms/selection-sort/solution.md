## Approach

Split the array into a sorted prefix `[0, i)` and an unsorted suffix `[i, n)`. For each `i`:

1. Scan the suffix to find the index `minIndex` of its smallest value.
2. Swap `numbers[i]` with `numbers[minIndex]` (skip the swap if they're the same position).

After step 2 the prefix is one longer and still sorted, because every value left in the suffix is `≥` the one just placed.

A common "brute force" mistake is swapping every time you find a new smaller value during the scan. That's still correct, but it does O(n²) swaps and throws away selection sort's only advantage. Track the index and swap once.

## Complexity

- **Time:** Θ(n²) comparisons in **every** case. The scan always examines the full suffix, so sorted input doesn't help.
- **Swaps:** at most n − 1. Compare that with insertion sort (up to n²/2 shifts) and bubble sort (up to n²/2 swaps).
- **Space:** O(1).

## Stability

The long-distance swap makes it **unstable**. Take `[2a, 2b, 1]`: the first pass swaps `2a` with `1`, giving `[1, 2b, 2a]`, so the two 2s are now reversed. You can make it stable by *rotating* the minimum into place instead of swapping, at the cost of O(n) writes per step.

## Edge cases

- Empty or single-element arrays: the outer loop doesn't run.
- Duplicates: using `<` (not `<=`) picks the first occurrence of the minimum.
- Return the same array reference.

## Talking through it in an interview

Selection sort is rarely the answer, so the value is in the comparison. Explain the invariant, write the loop, then contrast it with insertion sort: same O(n²), but insertion sort is adaptive and stable, while selection sort minimises writes. That shows you think about *which* cost dominates in a real system.

## Follow-ups

- **Heap sort is selection sort with a better data structure:** instead of a linear scan for the extreme value, use a heap to find it in O(log n), which gives O(n log n) overall.
- **Partial sorting:** stopping after k iterations gives the k smallest items in O(nk). That's fine for small k, though a heap is better.
