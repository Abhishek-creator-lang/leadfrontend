Write `binarySearch(sorted, target)`. `sorted` is an array of numbers in ascending order with **no duplicates**, for example the pixel offsets at which each row of a virtualised list starts. Return the index of `target`, or `-1` if it isn't present.

```js
const rowOffsets = [0, 48, 96, 160, 208, 300];

binarySearch(rowOffsets, 160); // 3
binarySearch(rowOffsets, 0);   // 0
binarySearch(rowOffsets, 170); // -1
binarySearch([], 5);           // -1
```

## Constraints

- Run in **O(log n)** time and O(1) extra space. A linear scan is too slow for the largest inputs.
- Don't use `indexOf`, `includes` or `findIndex`.
- The array may contain negative numbers.

## Follow-up

- How would you change it to return the index of the first offset `≥ target` (useful for "which row is at scroll position 170?")?
- What changes if duplicates are allowed and you need the first occurrence?
