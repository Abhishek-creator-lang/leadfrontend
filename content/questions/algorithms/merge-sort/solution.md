## Brute force

A quadratic sort (bubble, insertion or selection) is easy to write but does about n²/2 comparisons. At 100,000 items that is around 5 × 10⁹ operations, far too slow.

## Optimal: divide and conquer

1. **Divide.** An array of length 0 or 1 is already sorted. Otherwise split it at the midpoint.
2. **Conquer.** Recursively sort each half.
3. **Combine.** Merge two sorted arrays by repeatedly taking the smaller of the two front elements. When one side runs out, append the rest of the other.

The merge step is where the real work happens. With two read pointers `i` and `j`, every element is copied exactly once per level.

Using `<=` when comparing (`left[i] <= right[j]`) takes equal elements from the left half first. That keeps the sort **stable**: equal elements keep their original relative order.

The reference implementation allocates one scratch buffer up front and sorts index ranges, instead of creating new arrays with `slice` at every level. The slicing version is easier to explain and has the same big-O, so starting with it in an interview is fine. Mention the buffer as an optimisation.

## Complexity

- **Time:** O(n log n) in the best, average and worst case. There are log₂ n levels of splitting and each level merges n elements.
- **Space:** O(n) for the buffer plus O(log n) recursion depth.

## Edge cases

- Empty and single-element arrays return a copy (not the same reference).
- Duplicates, negatives, floats.
- Already-sorted and reverse-sorted input. Merge sort doesn't degrade on them, unlike naive quicksort.
- Don't compare with `>` on strings by accident; these are numbers.

## Talking through it in an interview

Explain the recurrence `T(n) = 2T(n/2) + O(n)`, which gives O(n log n). Write `merge` first as a standalone function, test it on two tiny arrays, then write the recursive driver. Call out stability and the O(n) extra memory as the trade-offs against quicksort.

## Follow-ups

- **Stability in UIs:** sorting by "last name" then by "department" with a stable sort keeps names ordered within each department. `Array.prototype.sort` has been required to be stable since ES2019.
- **Bottom-up:** merge runs of width 1, 2, 4, … in a loop. No recursion.
- **External sorting:** merge sort is the basis for sorting data that doesn't fit in memory, because it reads its inputs sequentially.
- **Timsort** (used by V8) finds naturally sorted runs and merges them, so it is O(n) on already-sorted data.
