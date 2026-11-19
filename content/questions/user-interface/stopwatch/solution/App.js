import React, { useEffect, useState } from 'react';
import './styles.css';

const pad = (n, len = 2) => String(n).padStart(len, '0');

export function formatElapsed(ms) {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalSeconds = Math.floor(totalCs / 100);
  const s = totalSeconds % 60;
  const m = Math.floor(totalSeconds / 60) % 60;
  const h = Math.floor(totalSeconds / 3600);
  const base = `${pad(m)}:${pad(s)}.${pad(cs)}`;
  return h > 0 ? `${h}:${base}` : base;
}

export default function App() {
  // Time is derived from timestamps: elapsed = banked + (now - startedAt).
  const [banked, setBanked] = useState(0); // ms accumulated in previous runs
  const [startedAt, setStartedAt] = useState(null); // performance.now() at the latest Start, or null
  const [now, setNow] = useState(0);
  const [laps, setLaps] = useState([]); // lap end times (total elapsed), oldest first

  const running = startedAt !== null;
  const elapsed = banked + (running ? now - startedAt : 0);

  // While running, re-render once per frame to refresh the display.
  // The value itself never depends on how often this fires.
  useEffect(() => {
    if (!running) return undefined;
    let frame;
    const step = () => {
      setNow(performance.now());
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  function start() {
    const t = performance.now();
    setStartedAt(t);
    setNow(t);
  }

  function stop() {
    const t = performance.now();
    setBanked((b) => b + (t - startedAt));
    setNow(t);
    setStartedAt(null);
  }

  function lap() {
    const total = banked + (performance.now() - startedAt);
    setLaps((prev) => [...prev, total]);
  }

  function reset() {
    setBanked(0);
    setLaps([]);
  }

  // Each lap's own duration = its end time minus the previous lap's end time.
  const lapRows = laps.map((end, i) => ({ number: i + 1, duration: end - (laps[i - 1] ?? 0) })).reverse();

  return (
    <main className="stopwatch">
      <p className="display" role="timer" aria-label="Elapsed time">
        {formatElapsed(elapsed)}
      </p>
      <div className="controls">
        {running ? (
          <button type="button" className="secondary" onClick={lap}>
            Lap
          </button>
        ) : (
          <button type="button" className="secondary" onClick={reset} disabled={elapsed === 0}>
            Reset
          </button>
        )}
        <button type="button" className="primary" data-running={running} onClick={running ? stop : start}>
          {running ? 'Stop' : 'Start'}
        </button>
      </div>
      {lapRows.length > 0 && (
        <ol className="laps" aria-label="Laps">
          {lapRows.map(({ number, duration }) => (
            <li key={number}>
              <span>Lap {number}</span>
              <span>{formatElapsed(duration)}</span>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
