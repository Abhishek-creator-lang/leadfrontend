Implement `dropRightWhile(array, predicate)`. Starting from the **end** of `array` and moving backwards, it drops elements while `predicate` returns a truthy value. It returns a new array with everything up to and including the last element that failed the predicate.

```js
dropRightWhile([1, 2, 3, 4], (n) => n > 2); // [1, 2]
dropRightWhile([5, 1, 6, 7], (n) => n > 2); // [5, 1]  (5 is kept: the scan stopped at 1)
dropRightWhile([1, 2], (n) => n > 2); // [1, 2]
dropRightWhile([3, 4], (n) => n > 2); // []

// Trim trailing empty rows from a CSV
dropRightWhile([['a', 1], ['b', 2], [], []], (row) => row.length === 0); // [['a', 1], ['b', 2]]
```

## Requirements

- `predicate` is called as `predicate(value, index, array)`, where `index` is the element's real index in `array`.
- Elements are visited from the last one backwards. Stop calling `predicate` as soon as it returns a falsy value.
- Return a new array. Don't mutate the input.

## Follow-up

- How would you implement this with the built-in `findLastIndex`?
- Write `takeRightWhile`, which returns the dropped part instead.
