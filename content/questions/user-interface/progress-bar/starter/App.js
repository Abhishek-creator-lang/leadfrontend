import React, { useState } from 'react';
import './styles.css';

// TODO: clamp the value, show the percentage, add progressbar ARIA, support an indeterminate state.
export function ProgressBar({ value, max = 100, label }) {
  return (
    <div className="progress">
      <div className="progress-fill" style={{ width: `${value}%` }} />
    </div>
  );
}

export default function App() {
  const [value, setValue] = useState(30);
  return (
    <main className="demo">
      <ProgressBar value={value} label="Upload progress" />
      {/* TODO: −10% / +10% buttons */}
    </main>
  );
}
