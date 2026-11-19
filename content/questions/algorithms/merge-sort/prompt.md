Implement `mergeSort(numbers)`. It returns a **new** array with the numbers in ascending order and leaves the input untouched, the way a table component sorts a copy of its rows without mutating the props it received.

Merge sort works by splitting the array in half, sorting each half, and merging the two sorted halves back together.

```js
const prices = [42, 7, 19, 7, -3, 100];
mergeSort(prices); // [-3, 7, 7, 19, 42, 100]
prices;            // [42, 7, 19, 7, -3, 100] (unchanged)

mergeSort([]);     // []
mergeSort([5]);    // [5]
```

## Constraints

- Don't use `Array.prototype.sort` or `toSorted`.
- Must run in O(n log n) time; inputs can contain 100,000+ numbers.
- Numbers may be negative, fractional or repeated.

## Follow-up

- Why is merge sort stable, and why does stability matter when sorting a table by one column and then another?
- How would you write it bottom-up, without recursion?
