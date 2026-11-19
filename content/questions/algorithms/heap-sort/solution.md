## Brute force

Selection sort repeatedly finds the maximum with a linear scan, which is O(n²) overall. Heap sort keeps the same idea ("move the max to the end, repeat") but stores the unsorted part as a heap, so finding and removing the maximum costs O(log n) instead of O(n).

## Optimal: in-place heap sort

The core helper is **`siftDown(a, i, size)`**: while node `i` has a child larger than itself, swap it with its **larger** child and continue from that child. It stops at a leaf or when the parent is already the largest. It touches one node per level, so it's O(log n).

1. **Heapify (build a max-heap).** Call `siftDown` on every non-leaf node, from the last one (`Math.floor(n / 2) - 1`) down to index 0. Leaves are trivially valid heaps, and working bottom-up means both subtrees are already heaps when you sift a parent.
2. **Extract.** For `end` from `n - 1` down to `1`: swap `a[0]` (the max) with `a[end]`, which is now in its final position, then `siftDown(a, 0, end)` to repair the heap over `[0, end)`.

## Complexity

- **Time:** O(n log n) worst, average and best case. It doesn't degrade on sorted or all-equal input.
- **Heapify alone is O(n):** most nodes are near the bottom and sift only a few levels. Summing (nodes at height h) × h gives n · Σ h/2^h, which converges to O(n).
- **Space:** O(1), using an iterative `siftDown`.
- **Not stable.**

## Edge cases

- Empty and single-element arrays.
- `siftDown` must compare against the *heap size*, not `a.length`. Otherwise the already sorted tail gets pulled back into the heap. This is the most common bug.
- When both children are equal, either choice works.

## Talking through it in an interview

Draw the array as a tree, write the index formulas, then write `siftDown` and test it on a three-element array. Explain the two phases separately. Bonus points for proving that heapify is O(n).

## Follow-ups

- **Why quicksort usually wins:** heap sort jumps around memory (parent ↔ child at roughly double the index), which is cache-unfriendly, and it does more comparisons on average.
- **Introsort** falls back to heap sort when quicksort recursion gets too deep, which gives the O(n log n) guarantee.
- **Heaps beyond sorting:** priority queues for schedulers, top-k queries, Dijkstra's algorithm, and merging k sorted streams. See *Min Heap*.
