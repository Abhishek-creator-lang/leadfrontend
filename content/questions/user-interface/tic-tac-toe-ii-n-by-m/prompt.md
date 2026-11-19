Extend tic-tac-toe so the board size and the winning line length are configurable. This is the **N × N board, M in a row** variant (Gomoku is 15 × 15 with 5 in a row).

The starter has a working 3 × 3 game that uses a hard-coded list of winning lines, plus two unconnected `<select>`s. Generalise it.

## Requirements

1. A **Board size** select (N = 3 to 8) and a **Marks in a row to win** select (M = 3 to N).
   - Changing either one starts a new game.
   - The win-length options never go above the board size. If N shrinks below the current M, clamp M to N.
2. X moves first and players alternate. Filled cells and moves after the game ends are ignored.
3. A player wins with **M consecutive marks** horizontally, vertically or on either diagonal. Highlight the winning run. A move that fills a gap, such as `X X _ X`, counts in both directions. A full board with no winner is a draw.
4. The win check must **not** rescan every line on the board after each move. Only check what the last move could have changed.
5. Keep the accessibility of the original:
   - Cells are named `Row r, column c, X | O | empty`.
   - A `role="status"` line shows `Next player: X`, `Player O wins!` or `It's a draw.`
   - The board is one tab stop with arrow-key, <kbd>Home</kbd>/<kbd>End</kbd> and <kbd>Ctrl</kbd>+<kbd>Home</kbd>/<kbd>End</kbd> navigation.
6. A **New game** button keeps the current settings.

## Follow-up

- Add a non-square board (R × C) and the "gravity" rule, which gives you Connect Four.
- What's the cost of your win check in terms of N and M? Of a full-board rescan?
- Rendering 50 × 50 = 2,500 buttons feels sluggish on every move. Why, and how do you fix it?
