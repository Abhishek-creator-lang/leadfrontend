## Brute force

- **Unsorted array:** `push` is O(1), but `pop` scans for the minimum, which is O(n).
- **Sorted array:** `pop` is O(1) from the end, but `push` has to insert in order, which is O(n) (binary search finds the spot, but splicing still shifts elements).

Either way, n operations cost O(n²). A heap makes both O(log n).

## Optimal: binary heap in an array

A binary heap is a **complete** binary tree in which every parent is `≤` its children. "Complete" means it fits perfectly in an array with no gaps:

- children of index `i`: `2i + 1` and `2i + 2`
- parent of index `i`: `(i - 1) >> 1`

The minimum is always at index 0.

**`push` (sift up):** append to the end, then swap it with its parent while it's smaller than the parent.

**`pop` (sift down):** save `heap[0]`, move the **last** element to the root, then repeatedly swap it with its *smaller* child until neither child is smaller. Moving the last element keeps the tree complete.

Both walk a single root-to-leaf path of length ⌊log₂ n⌋.

## Complexity

| Operation | Time |
|---|---|
| `push`, `pop` | O(log n) |
| `peek`, `size` | O(1) |

Space is O(n).

## Edge cases

- `pop` on an empty heap → `undefined`. On a one-element heap, don't move the last element onto itself and then sift: pop it and return it.
- Comparator direction: negative means "`a` comes out first". Passing `(a, b) => b - a` gives you a max-heap for free.
- Equal priorities: a heap is **not stable**. If FIFO order among equal priorities matters (it does for schedulers), add an increasing sequence number as a tie-breaker. React's scheduler does exactly this with `sortIndex` and then `id`.

## Talking through it in an interview

Draw the tree **and** the array side by side, write the index formulas, then implement `siftUp` and `siftDown` as helpers. Test `pop` mentally on a three-element heap where the smaller child is on the right. That's the case people get wrong.

## Follow-ups

- **Heapify in O(n):** sift down every non-leaf from the last to the first. Most nodes are near the bottom and barely move.
- **Decrease-key:** keep a `Map` from item to index and update it on every swap. Then you can sift up from a known index in O(log n). Dijkstra's algorithm needs this, or you can push duplicates and skip stale entries.
- **Uses:** top-k queries (a min-heap of size k), merging k sorted lists, median maintenance (two heaps), timers and task scheduling.
