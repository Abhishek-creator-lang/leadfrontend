import React from 'react';
import './styles.css';

// TODO: track the current time, rotate the hands, add hour ticks and an accessible name.
export function AnalogClock({ size = 240 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className="clock">
      <circle cx="100" cy="100" r="96" className="clock-face" />
      <line x1="100" y1="100" x2="100" y2="50" className="hand hand--hour" />
      <line x1="100" y1="100" x2="100" y2="30" className="hand hand--minute" />
      <line x1="100" y1="110" x2="100" y2="22" className="hand hand--second" />
    </svg>
  );
}

export default function App() {
  return <AnalogClock />;
}
