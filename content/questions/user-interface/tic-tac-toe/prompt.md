Build a two-player **tic-tac-toe** game on a 3 × 3 board. Players take turns on the same device. **X always goes first.**

The starter renders a static board with nine buttons and a status line. Make it playable and accessible.

## Requirements

1. Clicking an empty cell places the current player's mark. Turns alternate X → O → X…
2. Clicking a cell that's already filled does nothing.
3. After every move, check for a winner: three of the same mark in a row, column or diagonal.
   - Show `Player X wins!` (or O) and highlight the winning line.
   - When all nine cells are filled with no winner, show `It's a draw.`
   - Otherwise show `Next player: X` (or O).
   - Once the game is over, no more moves can be made.
4. A **New game** button resets the board.
5. Accessibility:
   - Each cell has an accessible name that describes its position and content, for example `Row 1, column 2, empty` or `Row 3, column 3, O`.
   - The status line is a live region (`role="status"`) so screen-reader users hear the result of each move.
   - The board is a single tab stop. Arrow keys move focus between cells (a roving `tabindex`), and <kbd>Enter</kbd>/<kbd>Space</kbd> place a mark.

## Example

```
 X | O | X
---+---+---
   | X | O        Status: Next player: O
---+---+---
   |   |
```

## Follow-up

- Add move history with "go back to move N" (time travel).
- Let the second player be a computer opponent. How would you make it unbeatable?
- How would you generalise the win check to an N × N board with K in a row?
