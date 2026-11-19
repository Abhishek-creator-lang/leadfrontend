import React, { useRef, useState } from 'react';
import './styles.css';

const DURATION_MS = 2000;
const MAX_CONCURRENT = 3;

function ProgressBar({ label, percent, queued }) {
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <div className="bar-fill" style={{ transform: `scaleX(${percent / 100})` }} />
      </div>
      <span className="bar-status" aria-hidden="true">{queued ? 'Queued' : `${percent}%`}</span>
    </div>
  );
}

export default function App() {
  const [bars, setBars] = useState([]); // { id, elapsed }
  const nextId = useRef(1);

  const add = () => {
    const id = nextId.current++;
    setBars((prev) => [...prev, { id, elapsed: 0 }]);
  };

  // TODO: one shared requestAnimationFrame loop that advances the first MAX_CONCURRENT unfinished bars.
  // TODO: Pause/Resume (keep progress), Reset, summary line.
  return (
    <main className="page">
      <div className="toolbar">
        <button type="button" onClick={add}>Add</button>
        <button type="button">Pause</button>
        <button type="button">Reset</button>
      </div>
      <ul className="bars">
        {bars.map((bar) => (
          <li key={bar.id}>
            <ProgressBar label={`Download ${bar.id}`} percent={0} queued={false} />
          </li>
        ))}
      </ul>
    </main>
  );
}
