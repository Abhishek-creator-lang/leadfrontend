import React from 'react';
import './styles.css';

const ROWS = 6;
const COLS = 7;

// TODO:
// - keep the board in state (useReducer recommended); drop discs with gravity
// - check for a win around the last disc only; detect draws
// - status line, New game, highlight the winning discs
// - column buttons: one tab stop, arrow keys, accessible names; accessible cell names
export default function App() {
  const board = Array(ROWS * COLS).fill(null);

  return (
    <main className="c4">
      <h1>Connect Four</h1>
      <p className="status">Red's turn</p>
      <div className="columns">
        {Array.from({ length: COLS }, (_, c) => (
          <button key={c} type="button" className="drop">
            ↓
          </button>
        ))}
      </div>
      <div className="board">
        {board.map((value, i) => (
          <div key={i} className="slot">
            <span className="disc" />
          </div>
        ))}
      </div>
    </main>
  );
}
