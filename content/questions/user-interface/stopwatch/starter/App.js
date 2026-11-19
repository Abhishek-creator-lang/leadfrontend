import React from 'react';
import './styles.css';

// TODO: track elapsed time accurately (timestamps, not tick counting), Start/Stop, Lap/Reset, laps list.
export default function App() {
  return (
    <main className="stopwatch">
      <p className="display">00:00.00</p>
      <div className="controls">
        <button type="button" className="secondary" disabled>
          Reset
        </button>
        <button type="button" className="primary">
          Start
        </button>
      </div>
    </main>
  );
}
