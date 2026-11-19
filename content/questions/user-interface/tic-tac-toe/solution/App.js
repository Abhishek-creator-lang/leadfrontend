import React, { useRef, useState } from 'react';
import './styles.css';

const SIZE = 3;

// Every line that wins: 3 rows, 3 columns, 2 diagonals (indices into a flat 9-cell array).
const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function getWinner(board) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line };
    }
  }
  return null;
}

export function TicTacToe() {
  // The board is the only real state. Everything else is derived from it on render.
  const [board, setBoard] = useState(() => Array(SIZE * SIZE).fill(null));
  // Which cell owns the single tab stop (roving tabindex).
  const [activeIndex, setActiveIndex] = useState(0);
  const cellRefs = useRef([]);

  const winner = getWinner(board);
  const filled = board.filter(Boolean).length;
  const isDraw = !winner && filled === board.length;
  const isOver = Boolean(winner) || isDraw;
  const currentPlayer = filled % 2 === 0 ? 'X' : 'O';
  const winningCells = new Set(winner ? winner.line : []);

  let status;
  if (winner) status = `Player ${winner.player} wins!`;
  else if (isDraw) status = "It's a draw.";
  else status = `Next player: ${currentPlayer}`;

  function play(index) {
    if (isOver || board[index]) return;
    setBoard((prev) => {
      const next = prev.slice();
      next[index] = currentPlayer;
      return next;
    });
  }

  function moveFocus(index) {
    setActiveIndex(index);
    cellRefs.current[index]?.focus();
  }

  function onKeyDown(event, index) {
    const row = Math.floor(index / SIZE);
    const col = index % SIZE;
    let target;
    switch (event.key) {
      case 'ArrowRight':
        target = row * SIZE + Math.min(col + 1, SIZE - 1);
        break;
      case 'ArrowLeft':
        target = row * SIZE + Math.max(col - 1, 0);
        break;
      case 'ArrowDown':
        target = Math.min(row + 1, SIZE - 1) * SIZE + col;
        break;
      case 'ArrowUp':
        target = Math.max(row - 1, 0) * SIZE + col;
        break;
      case 'Home':
        target = event.ctrlKey ? 0 : row * SIZE;
        break;
      case 'End':
        target = event.ctrlKey ? SIZE * SIZE - 1 : row * SIZE + SIZE - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    moveFocus(target);
  }

  function reset() {
    setBoard(Array(SIZE * SIZE).fill(null));
    setActiveIndex(0);
  }

  const rows = [];
  for (let r = 0; r < SIZE; r++) {
    rows.push(board.slice(r * SIZE, r * SIZE + SIZE));
  }

  return (
    <main className="game">
      <h1>Tic-tac-toe</h1>
      <p className="status" role="status">
        {status}
      </p>
      <div className="board" role="grid" aria-label="Tic-tac-toe board">
        {rows.map((cells, r) => (
          <div role="row" className="board-row" key={r}>
            {cells.map((value, c) => {
              const index = r * SIZE + c;
              const unavailable = isOver || Boolean(value);
              return (
                <div role="gridcell" key={c}>
                  <button
                    ref={(el) => (cellRefs.current[index] = el)}
                    type="button"
                    className={`cell${winningCells.has(index) ? ' cell--win' : ''}`}
                    data-mark={value || undefined}
                    tabIndex={index === activeIndex ? 0 : -1}
                    aria-label={`Row ${r + 1}, column ${c + 1}, ${value ?? 'empty'}`}
                    // aria-disabled (not disabled) keeps the cell focusable so arrow keys still reach it.
                    aria-disabled={unavailable}
                    onClick={() => play(index)}
                    onFocus={() => setActiveIndex(index)}
                    onKeyDown={(e) => onKeyDown(e, index)}
                  >
                    {value}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <button type="button" className="reset" onClick={reset}>
        New game
      </button>
    </main>
  );
}

export default function App() {
  return <TicTacToe />;
}
