Implement `Array.prototype.myReduce(callbackFn, initialValue)`, a polyfill for the native [`Array.prototype.reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce). It folds the array into a single value by calling `callbackFn(accumulator, currentValue, index, array)` for each element from left to right.

The starter attaches the function to `Array.prototype` and default-exports it.

```js
[1, 2, 3].myReduce((sum, n) => sum + n, 0); // 6
[1, 2, 3].myReduce((sum, n) => sum + n); // 6 (starts from 1, at index 1)
[].myReduce((sum, n) => sum + n, 10); // 10, callback never called
[].myReduce((sum, n) => sum + n); // throws TypeError
[[1], [2, 3]].myReduce((acc, a) => acc.concat(a), []); // [1, 2, 3]
```

## Requirements

- If `initialValue` is **provided**, the first call gets it as the accumulator and starts at index 0. "Provided" means passed as an argument, so an explicit `undefined` counts.
- If it is **not provided**, the first element that exists becomes the accumulator and iteration starts at the next index.
- Throw a `TypeError` when there is no initial value and the array has no elements (including an array made only of holes).
- Throw a `TypeError` if `callbackFn` is not a function.
- **Skip holes**, both when picking the starting accumulator and while iterating.
- Read the length once. Elements appended during iteration are not visited.
- Do not use the native `reduce`, `reduceRight` or `forEach`.

## Follow-up

- Implement `map` and `filter` on top of `reduce`.
- Why do many style guides discourage `reduce` without an initial value?
