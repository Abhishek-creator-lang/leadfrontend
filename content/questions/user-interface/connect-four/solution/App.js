import React, { useReducer, useRef, useState } from 'react';
import './styles.css';

const ROWS = 6;
const COLS = 7;
const CONNECT = 4;
const PLAYERS = ['red', 'yellow'];
const NAME = { red: 'Red', yellow: 'Yellow' };
const DIRECTIONS = [
  [0, 1], // horizontal
  [1, 0], // vertical
  [1, 1], // diagonal ↘
  [1, -1], // diagonal ↙
];

const at = (row, col) => row * COLS + col;

/** Lowest empty row in `col`, or -1 when the column is full. Row 0 is the top. */
export function landingRow(board, col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (!board[at(row, col)]) return row;
  }
  return -1;
}

/** Cells of a line of ≥ CONNECT through (row, col) for the disc there, or null. */
export function findLine(board, row, col) {
  const player = board[at(row, col)];
  for (const [dr, dc] of DIRECTIONS) {
    const line = [at(row, col)];
    for (const sign of [1, -1]) {
      let r = row + dr * sign;
      let c = col + dc * sign;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[at(r, c)] === player) {
        line.push(at(r, c));
        r += dr * sign;
        c += dc * sign;
      }
    }
    if (line.length >= CONNECT) return line;
  }
  return null;
}

const initialState = {
  board: Array(ROWS * COLS).fill(null),
  moves: 0,
  winner: null, // { player, line }
  lastMove: null, // { player, row, col }
};

function reducer(state, action) {
  switch (action.type) {
    case 'drop': {
      const { col } = action;
      const isOver = state.winner || state.moves === ROWS * COLS;
      const row = landingRow(state.board, col);
      if (isOver || row === -1) return state;
      const player = PLAYERS[state.moves % 2];
      const board = state.board.slice();
      board[at(row, col)] = player;
      const line = findLine(board, row, col);
      return {
        board,
        moves: state.moves + 1,
        winner: line ? { player, line } : null,
        lastMove: { player, row, col },
      };
    }
    case 'reset':
      return initialState;
    default:
      throw new Error(`Unknown action ${action.type}`);
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [activeCol, setActiveCol] = useState(0);
  const columnRefs = useRef([]);
  const { board, moves, winner, lastMove } = state;

  const isDraw = !winner && moves === ROWS * COLS;
  const isOver = Boolean(winner) || isDraw;
  const current = PLAYERS[moves % 2];
  const winSet = new Set(winner ? winner.line : []);

  let status;
  if (winner) status = `${NAME[winner.player]} wins!`;
  else if (isDraw) status = "It's a draw.";
  else {
    const last = lastMove ? `${NAME[lastMove.player]} dropped in column ${lastMove.col + 1}. ` : '';
    status = `${last}${NAME[current]}'s turn.`;
  }

  const drop = (col) => dispatch({ type: 'drop', col });

  function onColumnKeyDown(event, col) {
    let target;
    switch (event.key) {
      case 'ArrowRight':
        target = Math.min(col + 1, COLS - 1);
        break;
      case 'ArrowLeft':
        target = Math.max(col - 1, 0);
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = COLS - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setActiveCol(target);
    columnRefs.current[target]?.focus();
  }

  return (
    <main className="c4" data-turn={isOver ? undefined : current}>
      <h1>Connect Four</h1>
      <p className="status" role="status">
        {status}
      </p>

      <div className="columns" role="toolbar" aria-label="Choose a column">
        {Array.from({ length: COLS }, (_, c) => {
          const full = landingRow(board, c) === -1;
          return (
            <button
              key={c}
              ref={(el) => (columnRefs.current[c] = el)}
              type="button"
              className="drop"
              tabIndex={c === activeCol ? 0 : -1}
              aria-label={full ? `Column ${c + 1}, full` : `Drop in column ${c + 1}`}
              aria-disabled={full || isOver}
              onClick={() => drop(c)}
              onFocus={() => setActiveCol(c)}
              onKeyDown={(e) => onColumnKeyDown(e, c)}
            >
              <span aria-hidden="true">↓</span>
            </button>
          );
        })}
      </div>

      <div className="board" role="table" aria-label="Board">
        {Array.from({ length: ROWS }, (_, r) => (
          <div role="row" className="board-row" key={r}>
            {Array.from({ length: COLS }, (_, c) => {
              const value = board[at(r, c)];
              const isLast = lastMove && lastMove.row === r && lastMove.col === c;
              return (
                <div
                  key={c}
                  role="cell"
                  className="slot"
                  aria-label={`Row ${r + 1}, column ${c + 1}, ${value ?? 'empty'}`}
                  // Pointer convenience; the keyboard path is the column toolbar above.
                  onClick={() => drop(c)}
                >
                  {value && (
                    <span
                      // Re-keying on the move number restarts the drop animation only for the new disc.
                      key={isLast ? `last-${moves}` : 'disc'}
                      className={`disc disc--${value}${winSet.has(at(r, c)) ? ' disc--win' : ''}${
                        isLast ? ' disc--last' : ''
                      }`}
                      style={{ '--fall': r + 1 }}
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="reset"
        onClick={() => {
          dispatch({ type: 'reset' });
          setActiveCol(0);
        }}
      >
        New game
      </button>
    </main>
  );
}
