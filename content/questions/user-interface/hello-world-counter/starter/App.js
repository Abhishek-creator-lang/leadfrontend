import React from 'react';
import './styles.css';

export default function App() {
  // TODO: keep the count in state (start at 0, never below 0).
  const count = 0;

  return (
    <main className="counter">
      <h1>Counter</h1>
      {/* TODO: announce changes to screen readers */}
      <p className="counter-value">{count}</p>
      <div className="counter-actions">
        {/* TODO: wire up the buttons and disable them when they can't do anything */}
        <button type="button">−</button>
        <button type="button">+</button>
        <button type="button">Reset</button>
      </div>
    </main>
  );
}
