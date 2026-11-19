import React from 'react';
import './styles.css';

// TODO:
// - start / end a timed round, spawning 1–2 random moles every `moleInterval` ms
// - score hits, countdown, final message, Play again
// - clean up every timer
// - accessible hole names, number-key shortcuts, live result
export function WhackAMole({ holes = 9, duration = 15000, moleInterval = 900, random = Math.random }) {
  return (
    <main className="whack">
      <h1>Whack-a-Mole</h1>
      <div className="hud">
        <span>Score: 0</span>
        <span>Time left: {Math.ceil(duration / 1000)}s</span>
      </div>
      <div className="field">
        {Array.from({ length: holes }, (_, i) => (
          <button key={i} type="button" className="hole" />
        ))}
      </div>
      <button type="button" className="start">
        Start game
      </button>
    </main>
  );
}

export default function App() {
  return <WhackAMole />;
}
