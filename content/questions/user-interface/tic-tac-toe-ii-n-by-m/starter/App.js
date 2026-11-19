import React, { useState } from 'react';
import './styles.css';

// Hard-coded for 3 x 3. TODO: replace with a check that works for any N and M.
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

function getWinner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

const SIZES = [3, 4, 5, 6, 7, 8];

export default function App() {
  const size = 3; // TODO: drive from the "Board size" select
  const [board, setBoard] = useState(() => Array(size * size).fill(null));

  const winner = getWinner(board);
  const filled = board.filter(Boolean).length;
  const player = filled % 2 === 0 ? 'X' : 'O';

  function play(index) {
    if (winner || board[index]) return;
    const next = board.slice();
    next[index] = player;
    setBoard(next);
  }

  // TODO: settings, clamping, highlighting, accessible names, roving tabindex, New game.
  return (
    <main className="game">
      <h1>Tic-tac-toe II</h1>
      <div className="settings">
        <label>
          Board size{' '}
          <select defaultValue="3">
            {SIZES.map((n) => (
              <option key={n} value={n}>
                {n} × {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          Marks in a row to win{' '}
          <select defaultValue="3">
            <option value="3">3</option>
          </select>
        </label>
      </div>
      <p className="status">{winner ? `Player ${winner} wins!` : `Next player: ${player}`}</p>
      <div className="board" style={{ '--size': size }}>
        {board.map((value, index) => (
          <button key={index} type="button" className="cell" onClick={() => play(index)}>
            {value}
          </button>
        ))}
      </div>
    </main>
  );
}
