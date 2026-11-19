An avatar editor has a "rotate right" button. The avatar is a square `n × n` grid of pixel values. Write `rotateClockwise(grid)`, which rotates the grid **90° clockwise in place** (modifying `grid` itself) and returns it.

```js
const grid = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];
rotateClockwise(grid);
// grid is now
// [
//   [7, 4, 1],
//   [8, 5, 2],
//   [9, 6, 3],
// ]
```

After rotation, the old **first column** (read bottom to top) becomes the new **first row**.

## Requirements

- Rotate **in place**: the same outer array and the same row arrays must be returned, with only O(1) extra memory. Don't build a new grid and copy it back.
- Cells can hold any value (numbers, strings, objects).

## Constraints

- `0 ≤ n ≤ 1000`.

## Follow-up

- How would you rotate counter-clockwise, or by 180°?
- How would you rotate a non-square (m × n) grid, where an in-place rotation isn't possible?
