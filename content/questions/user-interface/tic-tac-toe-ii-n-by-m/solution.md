## What changes when the board is configurable

On a 3 × 3 board you can hard-code the 8 winning lines. On an N × N board with M in a row, the number of possible lines grows to about 4·N·(N − M + 1). Rescanning all of them after every move is wasteful, and it doesn't carry over to large or unbounded boards like Gomoku. The fix comes from one observation:

> **Only the cell that was just played can complete a new line.**

So check outward from the last move in 4 directions (horizontal, vertical, both diagonals). For each direction, walk forwards and backwards while the cells match, and count the run including the new cell. If the run is ≥ M, that player wins.

```js
for (const [dr, dc] of DIRECTIONS) {
  const line = [index];
  for (const sign of [1, -1]) { /* walk while same player, push indices */ }
  if (line.length >= winLength) return line;
}
```

Walking both ways is what handles the gap-filling case `X X _ X`. A check that only looks "to the right of the last move" misses it. That's a common bug, and there's a test for it.

**Complexity:** each move is O(4 · 2 · N) in the worst case (O(M) if you stop counting at M), no matter how full the board is. A full rescan is O(N² · M).

## State design: `useReducer`

The state now has several pieces that change together: `size`, `winLength`, `board`, `moves` and `winner`. A reducer keeps every transition in one pure, testable function:

| Action | Effect |
|---|---|
| `play` | Ignores filled cells and finished games. Places the mark, runs the last-move win check and stores `{ player, line }`. |
| `configure` | Clamps `winLength` to `size` and starts a fresh game |
| `reset` | Fresh game with the same settings |

`winner` is stored in state here (rather than derived on render as in part I) because computing it needs to know the *last move*, which only the reducer has. The reducer computes it in the same state update as the board, so the two can never disagree. That's the line between legitimate cached state and redundant state.

Clamping happens in the reducer (`Math.min(winLength, size)`), and the options list is generated from `size`, so the UI can't show an impossible combination such as 3 × 3 with 5 in a row.

The roving-focus index lives in a separate `useState`. It's UI state, not game state, so it shouldn't be part of "new game" semantics. Render clamps it (`Math.min(activeIndex, board.length - 1)`) so shrinking the board never leaves the tab stop on a cell that no longer exists.

## Accessibility

- `role="grid"` → `row` → `gridcell` > `button`, with the APG grid keyboard model: arrows, <kbd>Home</kbd>/<kbd>End</kbd> for the row, and <kbd>Ctrl</kbd>+<kbd>Home</kbd>/<kbd>End</kbd> for the first and last cell. Only one cell is tabbable.
- The grid's `aria-label` includes the rules ("5 by 5 board, 4 in a row wins") so screen-reader users get context that sighted users get from the selects.
- Cells are named `Row r, column c, X|O|empty`. `aria-disabled` keeps finished or filled cells focusable (see part I).
- The status line is `role="status"`, so each move's outcome is announced.
- Native `<select>`s wrapped in `<label>` give accessible names and keyboard behaviour for free.

## Performance at scale

A 50 × 50 board is 2,500 buttons. The naive version re-renders all of them and creates 2,500 × 3 new closures on every move. Two cheap fixes, both in the solution:

1. **`React.memo` cells with primitive props.** A move changes one cell's `value`, plus `isActive` and `isWin` on a few others. Every other cell skips rendering.
2. **Event delegation.** One `onClick`/`onKeyDown`/`onFocus` on the grid reads `data-index` from the target. Cells receive no function props, so memoisation can't be broken by new callback identities.

Beyond that: for an unbounded board (infinite Gomoku), store moves in a `Map<"r,c", player>` instead of a dense array and **virtualise** the viewport. Only cells on screen are rendered, and the win check is the same 4-direction walk over the map.

## Edge cases

- The win on the final move must be reported as a win, not a draw: `winner` is checked first.
- `M = N` turns into "fill a whole row, column or diagonal".
- Changing settings mid-game discards the game. In a real product, confirm first.
- A run longer than M (filling the middle of `XX_XX` with M = 3) highlights the whole run of 5. Decide with the interviewer whether "exactly M" is required. Some Gomoku rule sets forbid overlines.

## Follow-ups

- **R × C and gravity** turns this into Connect Four. The same 4-direction check works unchanged once the move index comes from "lowest empty row in the column".
- **AI for large boards:** minimax is infeasible. Discuss heuristic scoring of open runs, threat-space search or MCTS, run in a Web Worker.
- **Persistence / multiplayer:** serialise `{size, winLength, moves[]}`. Storing moves rather than the board gives you replay and undo for free, and the server re-validates each move with the same pure `findWinningLine`.
