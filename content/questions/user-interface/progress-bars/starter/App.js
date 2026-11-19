import React from 'react';
import './styles.css';

const DURATION_MS = 2000;

// TODO: animate from 0 to 100 over DURATION_MS and expose progressbar ARIA.
function ProgressBar({ label }) {
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar">
        <div className="bar-fill" style={{ width: '0%' }} />
      </div>
    </div>
  );
}

export default function App() {
  // TODO: keep a list of bars; Add appends one, Clear removes all.
  return (
    <main className="page">
      <div className="toolbar">
        <button type="button">Add</button>
        <button type="button">Clear</button>
      </div>
      <p className="hint">No downloads yet</p>
    </main>
  );
}
