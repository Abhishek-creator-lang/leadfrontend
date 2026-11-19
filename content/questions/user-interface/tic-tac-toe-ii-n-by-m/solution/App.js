import React, { memo, useMemo, useReducer, useRef, useState } from 'react';
import './styles.css';

const SIZES = [3, 4, 5, 6, 7, 8];
const MIN_WIN = 3;
// Right, down, down-right, down-left. Each direction is also walked backwards, so 4 directions cover all 8.
const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

/**
 * Returns the run of cells (sorted indices) through `index` that has at least
 * `winLength` marks of the same player, or null. Cost: O(N) per direction in the
 * worst case, independent of how full the board is.
 */
export function findWinningLine(board, size, index, winLength) {
  const player = board[index];
  if (!player) return null;
  const row = Math.floor(index / size);
  const col = index % size;

  for (const [dr, dc] of DIRECTIONS) {
    const line = [index];
    for (const sign of [1, -1]) {
      let r = row + dr * sign;
      let c = col + dc * sign;
      while (r >= 0 && r < size && c >= 0 && c < size && board[r * size + c] === player) {
        line.push(r * size + c);
        r += dr * sign;
        c += dc * sign;
      }
    }
    if (line.length >= winLength) return line.sort((a, b) => a - b);
  }
  return null;
}

function createGame(size, winLength) {
  return { size, winLength, board: Array(size * size).fill(null), moves: 0, winner: null };
}

function reducer(state, action) {
  switch (action.type) {
    case 'play': {
      const { index } = action;
      const isOver = state.winner || state.moves === state.board.length;
      if (isOver || state.board[index]) return state;
      const player = state.moves % 2 === 0 ? 'X' : 'O';
      const board = state.board.slice();
      board[index] = player;
      // Only the cell just played can complete a new line, so that's the only place we look.
      const line = findWinningLine(board, state.size, index, state.winLength);
      return { ...state, board, moves: state.moves + 1, winner: line ? { player, line } : null };
    }
    case 'configure': {
      const size = action.size ?? state.size;
      const winLength = Math.min(action.winLength ?? state.winLength, size);
      return createGame(size, winLength);
    }
    case 'reset':
      return createGame(state.size, state.winLength);
    default:
      throw new Error(`Unknown action ${action.type}`);
  }
}

// Memoised so a move re-renders only the cells whose props changed, not all N² cells.
const Cell = memo(function Cell({ index, row, col, value, isActive, isWin, unavailable }) {
  return (
    <div role="gridcell">
      <button
        type="button"
        data-index={index}
        className={`cell${isWin ? ' cell--win' : ''}`}
        data-mark={value || undefined}
        tabIndex={isActive ? 0 : -1}
        aria-label={`Row ${row + 1}, column ${col + 1}, ${value ?? 'empty'}`}
        aria-disabled={unavailable}
      >
        {value}
      </button>
    </div>
  );
});

export function Game() {
  const [state, dispatch] = useReducer(reducer, null, () => createGame(3, 3));
  const [activeIndex, setActiveIndex] = useState(0);
  const gridRef = useRef(null);
  const { size, winLength, board, moves, winner } = state;

  const isDraw = !winner && moves === board.length;
  const isOver = Boolean(winner) || isDraw;
  const player = moves % 2 === 0 ? 'X' : 'O';
  const winSet = useMemo(() => new Set(winner ? winner.line : []), [winner]);
  const focusIndex = Math.min(activeIndex, board.length - 1);

  let status;
  if (winner) status = `Player ${winner.player} wins!`;
  else if (isDraw) status = "It's a draw.";
  else status = `Next player: ${player}`;

  const indexOf = (target) => {
    const el = target.closest('[data-index]');
    return el ? Number(el.dataset.index) : null;
  };

  function focusCell(index) {
    setActiveIndex(index);
    gridRef.current?.querySelector(`[data-index="${index}"]`)?.focus();
  }

  // One delegated handler per event type on the grid instead of N² closures.
  function onClick(event) {
    const index = indexOf(event.target);
    if (index !== null) dispatch({ type: 'play', index });
  }

  function onFocus(event) {
    const index = indexOf(event.target);
    if (index !== null) setActiveIndex(index);
  }

  function onKeyDown(event) {
    const index = indexOf(event.target);
    if (index === null) return;
    const row = Math.floor(index / size);
    const col = index % size;
    const last = size - 1;
    const at = (r, c) => r * size + c;
    let target;
    switch (event.key) {
      case 'ArrowRight':
        target = at(row, Math.min(col + 1, last));
        break;
      case 'ArrowLeft':
        target = at(row, Math.max(col - 1, 0));
        break;
      case 'ArrowDown':
        target = at(Math.min(row + 1, last), col);
        break;
      case 'ArrowUp':
        target = at(Math.max(row - 1, 0), col);
        break;
      case 'Home':
        target = event.ctrlKey ? 0 : at(row, 0);
        break;
      case 'End':
        target = event.ctrlKey ? board.length - 1 : at(row, last);
        break;
      default:
        return;
    }
    event.preventDefault();
    focusCell(target);
  }

  function configure(change) {
    dispatch({ type: 'configure', ...change });
    setActiveIndex(0);
  }

  const winOptions = [];
  for (let m = MIN_WIN; m <= size; m++) winOptions.push(m);

  const rows = [];
  for (let r = 0; r < size; r++) {
    const cells = [];
    for (let c = 0; c < size; c++) {
      const index = r * size + c;
      cells.push(
        <Cell
          key={c}
          index={index}
          row={r}
          col={c}
          value={board[index]}
          isActive={index === focusIndex}
          isWin={winSet.has(index)}
          unavailable={isOver || Boolean(board[index])}
        />
      );
    }
    rows.push(
      <div role="row" className="board-row" key={r}>
        {cells}
      </div>
    );
  }

  return (
    <main className="game">
      <h1>Tic-tac-toe II</h1>
      <div className="settings">
        <label>
          Board size{' '}
          <select value={size} onChange={(e) => configure({ size: Number(e.target.value) })}>
            {SIZES.map((n) => (
              <option key={n} value={n}>
                {n} × {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          Marks in a row to win{' '}
          <select value={winLength} onChange={(e) => configure({ winLength: Number(e.target.value) })}>
            {winOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="status" role="status">
        {status}
      </p>
      <div
        ref={gridRef}
        className="board"
        role="grid"
        aria-label={`${size} by ${size} board, ${winLength} in a row wins`}
        style={{ '--size': size }}
        onClick={onClick}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
      >
        {rows}
      </div>
      <button type="button" className="reset" onClick={() => dispatch({ type: 'reset' })}>
        New game
      </button>
    </main>
  );
}

export default function App() {
  return <Game />;
}
