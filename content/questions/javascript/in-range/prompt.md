Implement `inRange(number, start, end)`. It returns `true` if `number` is in the **half-open** range from `start` (inclusive) up to `end` (exclusive), and `false` otherwise.

```js
inRange(3, 2, 4); // true
inRange(4, 2, 4); // false  (end is exclusive)
inRange(2, 2, 4); // true   (start is inclusive)

inRange(4, 8); // true   (only two arguments: the range is [0, 8))
inRange(-1, 8); // false

inRange(-3, -2, -6); // true  (start > end: the bounds are swapped to [-6, -2))
```

## Requirements

- If only two arguments are given (`end` is `undefined`), the second argument is the **end** and `start` is `0`.
- If `start > end`, swap them before checking.
- The check is `start <= number < end` after the steps above.
- If `start === end`, the range is empty and the result is always `false`.
- Any comparison with `NaN` is `false`, so `inRange(NaN, 0, 5)` is `false`.

## Follow-up

- When would you choose a closed `[start, end]` range over a half-open one? Why do slicing APIs use half-open ranges?
- How would you write this with a single comparison expression and no swapping?
