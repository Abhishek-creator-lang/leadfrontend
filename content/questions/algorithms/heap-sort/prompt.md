Implement `heapSort(numbers)`. It sorts the array **in place** in ascending order and returns the same array.

Heap sort first rearranges the array into a **binary max-heap**, a complete binary tree stored in the array itself, where every parent is `≥` its children. The largest value is then at index 0. It repeatedly swaps that maximum to the end of the array, shrinks the heap by one, and restores the heap property.

```js
const bundleSizesKb = [312, 48, 1024, 48, 7, 256];
heapSort(bundleSizesKb); // [7, 48, 48, 256, 312, 1024]
```

For a node at index `i`, its children are at `2i + 1` and `2i + 2`, and its parent is at `Math.floor((i - 1) / 2)`.

## Constraints

- Don't use `Array.prototype.sort` and don't allocate a second array: O(1) extra space.
- Must be O(n log n) in the **worst** case. Inputs can have 100,000+ elements, already sorted or all equal.

## Follow-up

- Why does building the heap bottom-up take only O(n), not O(n log n)?
- Heap sort has a better worst case than quicksort, so why is quicksort usually faster in practice?
