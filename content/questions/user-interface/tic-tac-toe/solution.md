## State design: store the board, derive the rest

The most important decision is how little state to keep. The board (`Array(9)` of `'X' | 'O' | null`) is the only thing that can't be computed from something else:

| Value | How it's computed | Why not state? |
|---|---|---|
| Current player | `filled % 2 === 0 ? 'X' : 'O'` | X always goes first, so the count decides whose turn it is |
| Winner and winning line | `getWinner(board)` scans the 8 lines | Recomputing 8 checks per render costs nothing |
| Draw | no winner and all 9 cells filled | |
| Game over | winner or draw | |

Candidates who add `const [xIsNext, setXIsNext] = useState(true)` and `const [winner, setWinner] = useState(null)` create values that can disagree with the board. Typical bugs: the winner is computed from the *previous* board inside the click handler, or "New game" forgets to reset one of them. Derived state removes that whole class of bug. This is the "avoid redundant state" principle from the React docs.

Updates create a new array (`prev.slice()`) instead of mutating. Mutating the existing array keeps the same reference, so React wouldn't re-render. Immutability also makes **time travel** easy: keep `history: Board[]` and a `step` index, and the current board becomes `history[step]`.

## Win detection

A hard-coded list of the 8 winning lines is the clearest solution for 3 × 3, and it also returns the line so the UI can highlight it. For larger boards (see the N × M follow-up question), check outward from the **last move** only, in 4 directions. That's O(K) per move instead of scanning the whole board.

## Accessibility

- **Accessible names.** A button containing just "X" or an empty string is meaningless to a screen-reader user. Each cell gets `aria-label="Row 1, column 2, X"`, so position and content are announced together.
- **Live status.** The status `<p>` has `role="status"` (a polite live region). After each move, assistive tech announces "Next player: O" or "Player X wins!" without moving focus.
- **Grid semantics and a roving tabindex.** The board uses `role="grid"` → `row` → `gridcell` with a button in each cell. Only one cell has `tabIndex=0`, so the whole board is a single <kbd>Tab</kbd> stop, and the arrow keys move between cells (APG grid pattern). `onFocus` keeps `activeIndex` in sync when the user clicks a cell, so <kbd>Tab</kbd> out and back returns to where they were.
- **`aria-disabled` instead of `disabled`.** A `disabled` button can't receive focus. That would break arrow-key navigation over filled cells and could drop focus to `<body>` when the game ends. `aria-disabled="true"` plus an early return in `play()` keeps the cell focusable and announced as unavailable.
- The highlight for the winning line isn't conveyed by colour alone: the status text says who won.

## Edge cases

- Clicking a filled cell, or any cell after the game ends: guarded in `play()`.
- A win on the 9th move must show as a **win**, not a draw. Check for a winner before checking for a draw.
- A double click is harmless, because the second click sees a filled cell.
- Using the functional `setBoard(prev => …)` form protects against batched updates. `currentPlayer` comes from the render that handled the click, which is correct because each click causes a re-render before the next one.

## Productionising / scaling

- **Computer opponent:** minimax with alpha-beta pruning is trivial at 3 × 3 (fewer than 9! states, and you can memoise by board string). Run the AI move in an effect after the human's move, or in a Web Worker for bigger boards so the main thread stays free.
- **Online multiplayer:** the server is the source of truth. The client sends `{ gameId, index }`, the server validates turn order and the win, and it broadcasts the new board over a WebSocket. Show the move optimistically and roll back if the server rejects it.
- **Reducer:** once you add history, an AI and a score, move to `useReducer` with actions like `PLAY`, `JUMP_TO` and `RESET`. The reducer is a pure function you can unit-test without rendering.

## Follow-ups an interviewer may ask

- *"Why not store `xIsNext`?"* It's redundant: it can be derived from the board and can get out of sync.
- *"Add undo."* Keep a history array and a step index. Undo means `step - 1`. A new move after undoing cuts off the redo stack.
- *"Make it N × N with K in a row."* Generate the lines programmatically, or check only from the last move.
- *"How would you test it?"* Query cells by role and accessible name, play a sequence of moves, and assert on the status text. That's exactly what `App.test.js` does.
