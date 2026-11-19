Implement `quickSort(numbers)`. It sorts the array **in place** in ascending order and returns the same array reference.

Quicksort picks a *pivot*, rearranges the array so that smaller values come before the pivot and larger values after it, then sorts each side the same way.

```js
const latencies = [120, 35, 35, 410, 8, 97];
const result = quickSort(latencies);
result;               // [8, 35, 35, 97, 120, 410]
result === latencies; // true (sorted in place)
```

## Constraints

- Don't use `Array.prototype.sort`.
- Expected O(n log n) time. Your implementation must stay fast (and must not overflow the call stack) on:
  - input that is **already sorted** or reverse sorted,
  - input where **every value is the same**.
- O(log n) extra space is fine; avoid allocating new arrays at every level.

## Follow-up

- Why is quicksort often faster than merge sort in practice, despite its O(n²) worst case?
- How would you turn your partition function into an O(n) "k-th smallest" algorithm?
