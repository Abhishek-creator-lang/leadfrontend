A pixel-art editor has a "count shapes" feature. The canvas is a grid of `0` (empty) and `1` (painted) cells. Painted cells that touch **horizontally or vertically** belong to the same shape; diagonal contact doesn't count.

Write `countIslands(grid)`, which returns the number of separate shapes.

```js
countIslands([
  [1, 1, 0, 0, 1],
  [1, 0, 0, 1, 1],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 0, 1],
]);
// 4: top-left blob, top-right blob, the lone centre cell, the bottom-right cell

countIslands([
  [1, 0],
  [0, 1],
]);
// 2 (diagonal neighbours are separate shapes)

countIslands([]);    // 0
countIslands([[0]]); // 0
```

## Requirements

- Rows all have the same length.
- **Don't mutate `grid`**; the editor still needs it.

## Constraints

- Up to 500 × 500 cells, and a single shape can cover nearly the whole grid. A recursive flood fill on a 250,000-cell shape may overflow the call stack.
- Aim for O(rows × cols).

## Follow-up

- Return the size of the largest shape.
- If cells are painted one at a time, how would you keep the count updated without rescanning (union-find)?
