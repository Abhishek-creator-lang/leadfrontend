## Model

The board is a flat array of `ROWS × COLS` cells (`'red' | 'yellow' | null`), with row 0 at the top and `at(r, c) = r * COLS + c`. A flat array is cheap to copy and easy to serialise. A column-major `string[][]` (one array per column, discs pushed in order) is an equally good choice that makes "gravity" a `push`. Mention both and pick one.

**Gravity:** `landingRow(board, col)` scans the column from the bottom for the first empty cell and returns -1 when the column is full. The same function decides whether a column button is disabled, so the UI and the rules can't disagree.

## State: `useReducer`

```
{ board, moves, winner: { player, line } | null, lastMove: { player, row, col } | null }
```

- **`drop`** finds the landing row, places the disc and runs the win check **from that cell only**. It ignores full columns and finished games, and it's a pure function, so it's easy to unit-test and reusable by an AI or a server.
- **Current player** is derived (`PLAYERS[moves % 2]`). So is "draw" (`moves === 42` with no winner).
- `winner` is stored because computing it needs `lastMove`, and it's computed in the same transition as the board, so the two never drift apart.
- `activeCol` (the roving focus) is separate UI state with `useState`. Resetting the game shouldn't depend on it, and it shouldn't be in the reducer.

## Win detection: O(1) per move

Only the new disc can complete a line. Walk out from it in 4 directions (→, ↓, ↘, ↙), forwards and backwards, counting matching discs. Any run ≥ 4 wins. That's at most 4 × 6 cell reads per move, compared with ~69 windows × 4 cells for a full-board scan. Walking both ways handles a disc dropped into the *middle* of a line (`R R _ R`).

## Accessibility

- **Column controls as a toolbar:** seven `Drop in column N` buttons in a `role="toolbar"` with a roving tabindex. That's one <kbd>Tab</kbd> stop, with <kbd>←</kbd>/<kbd>→</kbd>/<kbd>Home</kbd>/<kbd>End</kbd> to move and native <kbd>Enter</kbd>/<kbd>Space</kbd> to drop. A full column becomes `Column N, full` with `aria-disabled`, which keeps it focusable so arrow navigation doesn't skip and focus isn't lost.
- **Readable board:** the board is a `role="table"` with labelled cells (`Row 6, column 1, red`), so screen-reader users can explore it with table navigation. The cells themselves aren't interactive for the keyboard. Clicking a cell is a pointer convenience that delegates to the column.
- **Announcements:** the `role="status"` line says *what happened and what's next* ("Yellow dropped in column 4. Red's turn."). Without that, a screen-reader user has no idea where the disc landed.
- **Not colour alone:** yellow discs have an inner ring, and the winning line gets a green outline as well as the status text (WCAG 1.4.1).
- **Motion:** the fall animation is a CSS `transform` keyframe whose distance and duration scale with the row (`--fall`). It applies only to the newest disc, by re-keying that span, and it's turned off under `prefers-reduced-motion`.

## Edge cases

- Dropping into a full column, or after a win or draw: the reducer returns the same state (no re-render).
- A win on the 42nd disc is a win, not a draw, because `winner` is checked first.
- Double-clicking quickly is safe: each click is a separate dispatch against fresh state.

## Scaling and productionising

- **Configurable rules:** `ROWS`, `COLS` and `CONNECT` become props or reducer state. Nothing else changes, and the 4-direction walk works for any size.
- **AI opponent:** minimax with alpha-beta pruning, using a heuristic that scores open twos and threes and prefers centre columns. Depth 6–8 runs in milliseconds in a **Web Worker** (so the UI stays responsive). Order moves centre-first for better pruning. Connect Four is solved (first player wins), so a perfect AI is possible but unfriendly. Cap the depth for difficulty levels.
- **Online play:** the server is authoritative. The client sends `{ gameId, col }`, the server runs the same pure reducer, rejects out-of-turn or illegal moves, and broadcasts the new state over a WebSocket. Show the disc optimistically and reconcile when the server replies. Storing the **move list** (`[3, 3, 4, …]`) instead of the board gives you replays, undo and compact persistence.
- **Rendering:** 42 cells is trivial. On large custom boards, memoise cells and use event delegation, as in the tic-tac-toe II question.

## Follow-ups

- *"Undo?"* Pop the last move from the move list and replay, or store snapshots.
- *"Why `aria-disabled` and not `disabled` on full columns?"* Disabled buttons drop out of the focus order, which breaks arrow-key navigation and can throw focus to `<body>`.
- *"How would you test it?"* Exactly like the tests here: drop sequences via the named column buttons, then assert on cell names and the status text. Unit-test `findLine` and `landingRow` directly too.
