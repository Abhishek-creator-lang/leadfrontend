Implement `fill(array, value, start, end)` **without** using `Array.prototype.fill`. It overwrites the elements of `array` from index `start` up to, but not including, index `end` with `value`, and returns `array`.

```js
fill([1, 2, 3], 'a'); // ['a', 'a', 'a']
fill([4, 6, 8, 10], '*', 1, 3); // [4, '*', '*', 10]
fill([4, 6, 8, 10], '*', -2); // [4, 6, '*', '*']
fill([4, 6, 8, 10], '*', 1, -1); // [4, '*', '*', 10]
fill([1, 2, 3], 0, 5); // [1, 2, 3]   (start past the end: nothing to do)
```

## Requirements

- `start` defaults to `0`, `end` defaults to `array.length`.
- A **negative** index counts from the end: `-1` means `array.length - 1`. After that conversion, indices are clamped to `[0, array.length]`, so `-100` acts like `0` and `100` acts like `array.length`.
- If `start >= end` after normalisation, nothing changes.
- The array is **mutated in place**, and the same array reference is returned (this matches both lodash and the native method).
- The array never grows: filling past the end does not add elements.

## Follow-up

- `new Array(3).fill([])` is a classic bug. What's wrong with it, and how do you fix it?
- How would you write a non-mutating version?
