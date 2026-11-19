## Brute force: sort

`values.slice().sort((a, b) => b - a)[k - 1]` takes O(n log n) and is perfectly reasonable to say first. (Don't forget the comparator: the default sort is lexicographic, so `[10, 9, 100]` would sort as `[10, 100, 9]`.) It does more work than needed, because we don't care about the order of anything except the k-th position.

## Approach 2: min-heap of size k

Keep the k largest values seen so far in a **min**-heap. For each value, push it, and if the heap grows beyond k, pop the minimum. At the end the heap's top is the k-th largest. That's O(n log k) time and O(k) space. It's ideal when k is small, and it works on a **stream**.

## Approach 3: quickselect (reference)

Quickselect is quicksort that only recurses into the side containing the answer.

1. Copy the input (the prompt forbids mutation). The k-th largest is at index `target = n - k` in ascending order.
2. Pick a **random** pivot and do a **three-way partition** into `< pivot | === pivot | > pivot`, with boundaries `lt` and `gt`.
3. If `target` falls inside `[lt, gt]`, the pivot is the answer. If `target < lt`, continue in the left part; otherwise continue in the right part. It's a loop, not recursion.

Why these choices:

- **Random pivot:** a fixed pivot (first or last element) hits the O(n²) worst case on sorted input.
- **Three-way partition:** with heavy duplicates (`[7, 7, 7, …]`), a two-way partition can keep making lopsided splits. Grouping equal values ends the search immediately.

Expected time is O(n): n + n/2 + n/4 + … ≈ 2n comparisons. The worst case is O(n²), but with random pivots it's vanishingly unlikely. Space is O(n) for the copy, O(1) beyond it.

## Complexity summary

| Approach | Time | Extra space | Streaming? |
|---|---|---|---|
| Sort | O(n log n) | O(n) | No |
| Min-heap of size k | O(n log k) | O(k) | Yes |
| Quickselect | O(n) average | O(n) for the copy | No |
| Median of medians | O(n) worst case | O(n) | No |

## Edge cases

- `k = 1` (max) and `k = n` (min).
- Duplicates, all-equal arrays, and already-sorted input.
- Negative numbers.
- Don't mutate the input.

## Talking through it in an interview

Give the sort answer with its complexity, then ask how large k is and whether the data is a stream. That choice decides between the heap and quickselect. Code quickselect with a random pivot, and say why the pivot choice and the duplicate handling matter.

## Follow-ups

- **Streaming:** a min-heap of size k. Each new value costs O(log k), and the answer is always `heap.peek()`.
- **Percentiles at scale:** exact percentiles over huge data need multiple passes (bucket by value range, then select within one bucket). Observability tools use sketches instead (t-digest, HDR histograms), which give approximate percentiles in tiny memory.
- **Median of medians** guarantees O(n) in the worst case, but its constant factors are large, so it's rarely used in practice.
