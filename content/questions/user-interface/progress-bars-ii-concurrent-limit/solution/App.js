import React, { useEffect, useRef, useState } from 'react';
import './styles.css';

const DURATION_MS = 2000;
const MAX_CONCURRENT = 3;

function ProgressBar({ label, active, onComplete, duration = DURATION_MS }) {
  const [percent, setPercent] = useState(0);
  // Keep the latest callback in a ref so the animation effect doesn't restart when the parent re-renders.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    if (!active) return undefined;
    let frame;
    let start;
    const step = (now) => {
      if (start === undefined) start = now;
      const next = Math.min(100, Math.round(((now - start) / duration) * 100));
      setPercent(next);
      if (next < 100) frame = requestAnimationFrame(step);
      else onCompleteRef.current();
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, duration]);

  const done = percent >= 100;
  const status = done ? 'Done' : active ? `${percent}%` : 'Queued';

  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div
        className={`bar${active || done ? '' : ' bar--queued'}`}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={active || done ? `${percent}%` : 'Queued'}
      >
        <div className="bar-fill" style={{ transform: `scaleX(${percent / 100})` }} />
      </div>
      <span className="bar-status" aria-hidden="true">
        {status}
      </span>
    </div>
  );
}

export default function App() {
  const [bars, setBars] = useState([]);
  const nextId = useRef(1);

  const add = () => {
    const id = nextId.current++;
    setBars((prev) => [...prev, { id, label: `Download ${id}`, done: false }]);
  };

  const complete = (id) => setBars((prev) => prev.map((b) => (b.id === id ? { ...b, done: true } : b)));

  // Derived, not stored: the first MAX_CONCURRENT unfinished bars (in insertion order) are running.
  const runningIds = new Set(
    bars
      .filter((b) => !b.done)
      .slice(0, MAX_CONCURRENT)
      .map((b) => b.id)
  );
  const doneCount = bars.filter((b) => b.done).length;
  const queuedCount = bars.length - doneCount - runningIds.size;

  return (
    <main className="page">
      <div className="toolbar">
        <button type="button" onClick={add}>
          Add
        </button>
        <button type="button" onClick={() => setBars([])} disabled={bars.length === 0}>
          Clear
        </button>
      </div>
      <p className="summary">
        {runningIds.size} running · {queuedCount} queued · {doneCount} done
      </p>
      <ul className="bars">
        {bars.map((bar) => (
          <li key={bar.id}>
            <ProgressBar label={bar.label} active={runningIds.has(bar.id)} onComplete={() => complete(bar.id)} />
          </li>
        ))}
      </ul>
    </main>
  );
}
