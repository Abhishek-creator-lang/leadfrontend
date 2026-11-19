import React from 'react';
import './styles.css';

export const CONFIG = [
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 1],
];

// TODO:
// - track the activation order of lights
// - once every light is on, switch them off in reverse order every `delay` ms
// - ignore clicks while deactivating; clean up timers
// - aria-pressed toggles with position-based names, an announcement when deactivation starts
export function GridLights({ config = CONFIG, delay = 300 }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: `repeat(${config[0].length}, 64px)` }}>
      {config.flat().map((cell, index) =>
        cell ? <button key={index} type="button" className="light" /> : <span key={index} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <main>
      <h1>Grid Lights</h1>
      <GridLights />
    </main>
  );
}
