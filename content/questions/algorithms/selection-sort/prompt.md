Implement `selectionSort(numbers)`. It sorts the array **in place** in ascending order and returns the same array.

Selection sort scans the unsorted part of the array for its smallest value and swaps it into the next position of the sorted part. Its claim to fame is that it performs **at most n − 1 swaps**, which matters when moving an item is far more expensive than comparing two, for example reordering physical slots or rewriting large records.

```js
const zIndexes = [30, 10, 50, 20, 10];
selectionSort(zIndexes); // [10, 10, 20, 30, 50]
```

## Constraints

- Don't use `Array.prototype.sort`.
- Use O(1) extra space.
- Perform at most one swap per position, so at most n − 1 swaps in total.
- Inputs have at most a few thousand elements.

## Follow-up

- Is selection sort stable? Can you show a counter-example?
- What is its best-case time complexity, and why doesn't it improve on sorted input?
