A dashboard intro animation reveals the tiles of a grid in a **clockwise spiral**: across the top row, down the right edge, back along the bottom, up the left edge, then the same again one ring further in. Write `spiralOrder(grid)`, which returns the cell values in that order.

The grid is `rows × cols` and doesn't have to be square.

```js
spiralOrder([
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
]);
// [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]

spiralOrder([[1], [2], [3]]); // [1, 2, 3]
spiralOrder([[1, 2, 3]]);     // [1, 2, 3]
spiralOrder([]);              // []
```

## Requirements

- Every cell appears exactly once.
- Don't mutate `grid`.

## Constraints

- Up to 1000 × 1000 cells. Aim for O(rows × cols) time.

## Follow-up

- Generate the reverse: fill an `n × n` grid with `1..n²` in spiral order.
- How would you animate the reveal with CSS only, given the order?
