/**
 * @param {Array<Array<0 | 1>>} grid
 * @return {number} Number of 4-directionally connected groups of 1s.
 */
export default function countIslands(grid) {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  if (rows === 0 || cols === 0) return 0;

  const visited = new Uint8Array(rows * cols);
  const stack = [];
  let islands = 0;

  const tryPush = (r, c) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    const id = r * cols + c;
    if (visited[id] || grid[r][c] !== 1) return;
    visited[id] = 1;
    stack.push(id);
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1 || visited[r * cols + c]) continue;

      islands++;
      tryPush(r, c);
      // Iterative flood fill so huge islands can't overflow the call stack.
      while (stack.length > 0) {
        const id = stack.pop();
        const cr = Math.floor(id / cols);
        const cc = id % cols;
        tryPush(cr - 1, cc);
        tryPush(cr + 1, cc);
        tryPush(cr, cc - 1);
        tryPush(cr, cc + 1);
      }
    }
  }

  return islands;
}
