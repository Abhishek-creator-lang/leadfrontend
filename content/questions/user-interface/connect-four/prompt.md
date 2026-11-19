Build **Connect Four** for two players on one device. The board has **7 columns × 6 rows**. Players take turns dropping a disc into a column. The disc falls to the **lowest empty cell** in that column. The first player to line up **four** discs horizontally, vertically or diagonally wins. **Red** moves first, then **Yellow**.

The starter renders an empty board and a row of column buttons.

## Requirements

1. Clicking a column button, or any cell in that column, drops the current player's disc into that column.
2. A full column can't take more discs. Its button is named `Column 3, full` and is marked unavailable.
3. Detect a win after every move by checking **only around the disc just placed**. Highlight the winning discs. When the board fills with no winner, it's a draw.
4. A status line (`role="status"`) shows whose turn it is and the last move, for example `Yellow dropped in column 4. Red's turn.`, or `Red wins!` / `It's a draw.` After the game ends, drops are ignored.
5. A **New game** button resets the board.
6. Accessibility:
   - Column buttons are named `Drop in column N` and form a single tab stop. <kbd>←</kbd>/<kbd>→</kbd> move between columns, <kbd>Home</kbd>/<kbd>End</kbd> jump to the first and last column, and <kbd>Enter</kbd>/<kbd>Space</kbd> drop.
   - Board cells expose their contents: `Row 6, column 1, red`.
   - Disc colours aren't the only cue (for example, add a pattern or a letter for Yellow) so colour-blind players can tell them apart.
7. Animate the disc falling, and respect `prefers-reduced-motion`.

## Follow-up

- Add an AI opponent. How deep can minimax go in the browser, and where would you run it?
- Make rows, columns and the line length configurable.
- How would you sync a game between two browsers?
