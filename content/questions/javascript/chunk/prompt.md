Implement `chunk(array, size)`. It splits `array` into consecutive groups ("chunks") of `size` elements and returns them as a new array of arrays. If the elements don't divide evenly, the last chunk holds whatever is left over.

Chunking shows up whenever a list has to be processed in pieces: rendering a grid row by row, sending items to an API that accepts at most 50 per request, or paging through results.

```js
chunk(['a', 'b', 'c', 'd'], 2); // [['a', 'b'], ['c', 'd']]
chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
chunk([1, 2, 3], 5); // [[1, 2, 3]]
chunk([1, 2, 3]); // [[1], [2], [3]]   (size defaults to 1)
chunk([], 3); // []
```

## Requirements

- `size` defaults to `1`.
- A non-integer `size` is rounded **down** (`2.7` behaves like `2`).
- If `size` is less than `1` after rounding, return an empty array.
- Return a **new** array. The input array must not be modified.
- Elements are copied by reference (a shallow chunk), in their original order.

## Follow-up

- How would you write `chunk` for an iterable or a stream that you can't index into?
- How would you use `chunk` to send a large list of IDs to an API in batches, with at most two requests in flight?
