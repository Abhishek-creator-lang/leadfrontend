/**
 * Rotates a square grid 90 degrees clockwise in place.
 * @param {Array<Array<*>>} grid n x n
 * @return {Array<Array<*>>} The same grid.
 */
export default function rotateClockwise(grid) {
  const n = grid.length;

  // 1. Transpose: swap across the main diagonal (upper triangle only).
  for (let r = 0; r < n; r++) {
    for (let c = r + 1; c < n; c++) {
      const tmp = grid[r][c];
      grid[r][c] = grid[c][r];
      grid[c][r] = tmp;
    }
  }

  // 2. Mirror horizontally.
  for (const row of grid) row.reverse();

  return grid;
}
