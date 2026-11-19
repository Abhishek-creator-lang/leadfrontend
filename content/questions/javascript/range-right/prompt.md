Implement `rangeRight(start, end, step)`. It returns exactly the numbers that `range(start, end, step)` would produce, but in **reverse order**: the value closest to `end` comes first and `start` comes last.

```js
rangeRight(4); // [3, 2, 1, 0]
rangeRight(-4); // [-3, -2, -1, 0]
rangeRight(1, 5); // [4, 3, 2, 1]
rangeRight(0, 20, 5); // [15, 10, 5, 0]
rangeRight(0, 10, 3); // [9, 6, 3, 0]
rangeRight(5, 1); // [2, 3, 4, 5]
rangeRight(0, 5, -1); // []
rangeRight(1, 4, 0); // [1, 1, 1]
```

## Requirements

The argument rules are the same as `range`:

- **One argument:** `rangeRight(end)` means `start = 0`.
- **Default step:** `1` if `end >= start`, otherwise `-1`.
- **Length:** `max(ceil((end - start) / step), 0)`, using `1` instead of a zero step.
- **Values:** the element at position `i` (counting from the **end** of the result) is `start + i * step`. So the last element is always `start`, and the first is `start + (length - 1) * step`.
- Don't build the forward array and call `reverse()`. Generate the values in their final order.

## Follow-up

- Why is the first element of `rangeRight(0, 10, 3)` equal to `9` and not `10` or `7`?
- When would a descending range be useful in UI code?
