import React from 'react';
import './styles.css';

const SIZE = 3;

// TODO:
// - keep the board in state and alternate X / O on click
// - detect a winner or a draw and update the status line
// - add a "New game" button
// - give every cell an accessible name ("Row 1, column 2, empty") and make the
//   board a single tab stop with arrow-key navigation
export default function App() {
  const cells = Array(SIZE * SIZE).fill(null);

  return (
    <main className="game">
      <h1>Tic-tac-toe</h1>
      <p className="status">Next player: X</p>
      <div className="board">
        {cells.map((value, index) => (
          <button key={index} type="button" className="cell">
            {value}
          </button>
        ))}
      </div>
    </main>
  );
}
