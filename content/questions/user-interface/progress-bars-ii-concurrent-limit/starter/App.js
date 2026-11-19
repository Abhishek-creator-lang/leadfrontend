import React, { useEffect, useRef, useState } from 'react';
import './styles.css';

const DURATION_MS = 2000;
const MAX_CONCURRENT = 3;

// Works, but every bar starts immediately.
function ProgressBar({ label, duration = DURATION_MS }) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    let frame;
    let start;
    const step = (now) => {
      if (start === undefined) start = now;
      const next = Math.min(100, Math.round(((now - start) / duration) * 100));
      setPercent(next);
      if (next < 100) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [duration]);

  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <div className="bar-fill" style={{ transform: `scaleX(${percent / 100})` }} />
      </div>
      <span className="bar-status" aria-hidden="true">{percent >= 100 ? 'Done' : `${percent}%`}</span>
    </div>
  );
}

export default function App() {
  const [bars, setBars] = useState([]);
  const nextId = useRef(1);

  const add = () => {
    const id = nextId.current++;
    setBars((prev) => [...prev, { id, label: `Download ${id}` }]);
  };

  // TODO: only MAX_CONCURRENT bars may run at once; queue the rest; show a summary line.
  return (
    <main className="page">
      <div className="toolbar">
        <button type="button" onClick={add}>Add</button>
        <button type="button" onClick={() => setBars([])}>Clear</button>
      </div>
      <ul className="bars">
        {bars.map((bar) => (
          <li key={bar.id}>
            <ProgressBar label={bar.label} />
          </li>
        ))}
      </ul>
    </main>
  );
}
