Implement `range(start, end, step)`. It returns an array of numbers that starts at `start` and moves by `step` up to, but **not including**, `end`.

```js
range(4); // [0, 1, 2, 3]
range(-4); // [0, -1, -2, -3]
range(1, 5); // [1, 2, 3, 4]
range(0, 20, 5); // [0, 5, 10, 15]
range(0, -4, -1); // [0, -1, -2, -3]
range(5, 1); // [5, 4, 3, 2]   (step defaults to -1 when end < start)
range(0, 1, 0.25); // [0, 0.25, 0.5, 0.75]
range(0, 5, -1); // []   (step points away from end)
range(1, 4, 0); // [1, 1, 1]
range(0); // []
```

## Requirements

- **One argument:** `range(end)` means `start = 0`.
- **Default step:** `1` if `end >= start`, otherwise `-1`.
- **Length:** the result has `max(ceil((end - start) / step), 0)` elements. This gives `[]` when the step points away from `end`.
- **Zero step:** treat the step as `1` for computing the length, but add `0` each time. `range(1, 4, 0)` is `[1, 1, 1]` (this matches lodash).
- Compute each element as `start + i * step`, not by adding `step` repeatedly, so fractional steps don't accumulate rounding error.

## Follow-up

- How would you write `range` as a lazy generator, and when would that be better?
- Why does `Array(5).map((_, i) => i)` not work, while `Array.from({ length: 5 }, (_, i) => i)` does?
