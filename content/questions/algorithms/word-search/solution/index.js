/**
 * @param {string[][]} board Grid of single-character tiles.
 * @param {string} word Non-empty.
 * @return {boolean}
 */
export default function canTrace(board, word) {
  const rows = board.length;
  const cols = rows > 0 ? board[0].length : 0;
  if (word.length === 0) return true;
  if (word.length > rows * cols) return false;

  // Pruning 1: the board must contain enough of every letter.
  const available = new Map();
  for (const row of board) for (const ch of row) available.set(ch, (available.get(ch) ?? 0) + 1);
  const needed = new Map();
  for (const ch of word) needed.set(ch, (needed.get(ch) ?? 0) + 1);
  for (const [ch, count] of needed) {
    if ((available.get(ch) ?? 0) < count) return false;
  }

  // Pruning 2: start from whichever end of the word is rarer on the board.
  let target = word;
  if (available.get(word[word.length - 1]) < available.get(word[0])) {
    target = [...word].reverse().join('');
  }

  const inUse = new Uint8Array(rows * cols);

  function dfs(r, c, i) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    const id = r * cols + c;
    if (inUse[id] || board[r][c] !== target[i]) return false;
    if (i === target.length - 1) return true;

    inUse[id] = 1;
    const found = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
    inUse[id] = 0; // backtrack
    return found;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }
  return false;
}
