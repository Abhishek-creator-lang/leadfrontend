/**
 * @param {Array<Array<*>>} grid rows x cols
 * @return {Array<*>} Cells in clockwise spiral order.
 */
export default function spiralOrder(grid) {
  const out = [];
  if (grid.length === 0 || grid[0].length === 0) return out;

  let top = 0;
  let bottom = grid.length - 1;
  let left = 0;
  let right = grid[0].length - 1;

  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) out.push(grid[top][c]);
    top++;

    for (let r = top; r <= bottom; r++) out.push(grid[r][right]);
    right--;

    if (top <= bottom) {
      for (let c = right; c >= left; c--) out.push(grid[bottom][c]);
      bottom--;
    }

    if (left <= right) {
      for (let r = bottom; r >= top; r--) out.push(grid[r][left]);
      left++;
    }
  }

  return out;
}
