import React from 'react';
import './styles.css';

const SIZE = 16;

export const COLORS = [
  { name: 'Black', value: '#0f172a' },
  { name: 'White', value: '#ffffff' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#facc15' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
];

// TODO:
// - selected colour + tool (Draw / Erase) state, Clear button
// - paint on mouse down, keep painting while the button is held, stop on mouse up anywhere
// - grid semantics (role="grid", gridcell names), roving tabindex + arrow keys, Space/Enter to paint
export default function App() {
  return (
    <main className="app">
      <h1>Pixel art</h1>
      <div className="palette">
        {COLORS.map((c) => (
          <span key={c.name} className="swatch" style={{ background: c.value }} />
        ))}
      </div>
      <div className="canvas" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {Array.from({ length: SIZE * SIZE }, (_, i) => (
          <div key={i} className="cell" />
        ))}
      </div>
    </main>
  );
}
