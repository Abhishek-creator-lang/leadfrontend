import React from 'react';
import './styles.css';

const ROWS = 6;
const COLS = 8;

// TODO:
// - selection state; drag (mousedown → mouseover → mouseup anywhere) selects the anchor→pointer rectangle
// - Ctrl/⌘ + drag adds to the selection, a plain drag replaces it
// - "N cells selected" status
// - grid semantics (aria-multiselectable, aria-selected), roving tabindex,
//   arrows / Shift+arrows / Space / Ctrl+A / Escape
export default function App() {
  return (
    <main className="app">
      <h1>Pick your slots</h1>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {Array.from({ length: ROWS * COLS }, (_, i) => (
          <div key={i} className="cell" />
        ))}
      </div>
    </main>
  );
}
