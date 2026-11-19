import React, { useEffect, useReducer } from 'react';
import './styles.css';

const DURATION_MS = 2000;
const MAX_CONCURRENT = 3;

const initialState = { bars: [], nextId: 1, paused: false };

// Which bars may advance: the first MAX_CONCURRENT unfinished ones, in insertion order.
function runningIds(bars) {
  return new Set(
    bars
      .filter((b) => b.elapsed < DURATION_MS)
      .slice(0, MAX_CONCURRENT)
      .map((b) => b.id)
  );
}

function reducer(state, action) {
  switch (action.type) {
    case 'add':
      return { ...state, bars: [...state.bars, { id: state.nextId, elapsed: 0 }], nextId: state.nextId + 1 };
    case 'toggle':
      return { ...state, paused: !state.paused };
    case 'reset':
      return { ...state, bars: [], paused: false };
    case 'tick': {
      if (state.paused) return state;
      const running = runningIds(state.bars);
      if (running.size === 0) return state;
      return {
        ...state,
        bars: state.bars.map((b) =>
          running.has(b.id) ? { ...b, elapsed: Math.min(DURATION_MS, b.elapsed + action.dt) } : b
        ),
      };
    }
    default:
      throw new Error(`Unknown action ${action.type}`);
  }
}

function ProgressBar({ label, percent, queued }) {
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div
        className={`bar${queued ? ' bar--queued' : ''}`}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={queued ? 'Queued' : `${percent}%`}
      >
        <div className="bar-fill" style={{ transform: `scaleX(${percent / 100})` }} />
      </div>
      <span className="bar-status" aria-hidden="true">
        {queued ? 'Queued' : percent >= 100 ? 'Done' : `${percent}%`}
      </span>
    </div>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { bars, paused } = state;

  const running = runningIds(bars);
  const hasWork = !paused && running.size > 0;

  // One shared clock. It runs only while something can move, and restarts cleanly on resume,
  // so time spent paused is never counted.
  useEffect(() => {
    if (!hasWork) return undefined;
    let frame;
    let last; // set from the first frame's timestamp, so both readings come from the same clock
    const step = (now) => {
      // Cap dt so a long throttled gap (background tab) doesn't complete bars in one jump.
      const dt = last === undefined ? 0 : Math.max(0, Math.min(now - last, 100));
      last = now;
      if (dt > 0) dispatch({ type: 'tick', dt });
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [hasWork]);

  const done = bars.filter((b) => b.elapsed >= DURATION_MS).length;
  const queued = bars.length - done - running.size;

  return (
    <main className="page">
      <div className="toolbar">
        <button type="button" onClick={() => dispatch({ type: 'add' })}>
          Add
        </button>
        <button type="button" onClick={() => dispatch({ type: 'toggle' })}>
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button type="button" onClick={() => dispatch({ type: 'reset' })} disabled={bars.length === 0 && !paused}>
          Reset
        </button>
      </div>
      <p className="summary">
        {paused ? 'Paused · ' : ''}
        {running.size} running · {queued} queued · {done} done
      </p>
      <ul className="bars">
        {bars.map((bar) => (
          <li key={bar.id}>
            <ProgressBar
              label={`Download ${bar.id}`}
              percent={Math.round((bar.elapsed / DURATION_MS) * 100)}
              queued={!running.has(bar.id) && bar.elapsed === 0}
            />
          </li>
        ))}
      </ul>
    </main>
  );
}
