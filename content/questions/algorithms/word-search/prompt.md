You're building a browser word game. The board is a grid of letter tiles, and a player forms a word by dragging through tiles that are **horizontally or vertically adjacent**, never using the same tile twice in one word.

Write `canTrace(board, word)`, which returns `true` if `word` can be traced on `board`.

```js
const board = [
  ['R', 'E', 'A', 'C'],
  ['S', 'T', 'X', 'T'],
  ['H', 'O', 'O', 'K'],
];

canTrace(board, 'REACT'); // true  (R → E → A → C → T, down from C)
canTrace(board, 'HOOK');  // true
canTrace(board, 'SHOT');  // true  (S → H → O → T, up from the first O)
canTrace(board, 'TEST');  // false (no S is adjacent to the E)
canTrace(board, 'STORE'); // false
canTrace(board, 'HOOH');  // false (would need the H tile twice)
```

## Requirements

- Matching is case-sensitive.
- Diagonal moves are not allowed.
- `word` is non-empty. **Don't mutate `board`** (or, if you mark tiles temporarily, restore them before returning).

## Constraints

- Board up to 20 × 20, word up to 30 letters.
- Backtracking is expected; add cheap pruning so hopeless searches fail fast.

## Follow-up

- How would you find **all** words from a dictionary on the board efficiently?
- What pruning tricks reduce the search?
