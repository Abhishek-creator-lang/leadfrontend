import React, { useId, useState } from 'react';
import './styles.css';

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export function ProgressBar({ value, max = 100, label }) {
  const labelId = useId();
  const indeterminate = value === null || value === undefined || Number.isNaN(value);
  const safeMax = max > 0 ? max : 100;
  const current = indeterminate ? 0 : clamp(value, 0, safeMax);
  const percent = Math.round((current / safeMax) * 100);

  return (
    <div className="progress-field">
      <div className="progress-label">
        <span id={labelId}>{label}</span>
        {!indeterminate && <span aria-hidden="true">{percent}%</span>}
      </div>
      <div
        className={`progress${indeterminate ? ' progress--indeterminate' : ''}`}
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={indeterminate ? undefined : current}
        aria-valuetext={indeterminate ? undefined : `${percent}%`}
      >
        <div
          className="progress-fill"
          // scaleX is GPU-composited, unlike animating `width`.
          style={indeterminate ? undefined : { transform: `scaleX(${current / safeMax})` }}
        />
      </div>
    </div>
  );
}

export default function App() {
  const [value, setValue] = useState(30);
  const change = (delta) => setValue((v) => clamp(v + delta, 0, 100));

  return (
    <main className="demo">
      <ProgressBar value={value} label="Upload progress" />
      <div className="controls">
        <button type="button" onClick={() => change(-10)} disabled={value <= 0}>
          −10%
        </button>
        <button type="button" onClick={() => change(10)} disabled={value >= 100}>
          +10%
        </button>
      </div>
      <ProgressBar value={null} label="Preparing files" />
    </main>
  );
}
