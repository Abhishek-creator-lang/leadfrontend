import React from 'react';
import './styles.css';

const DEFAULT_CONFIG = {
  green: { duration: 3000, next: 'yellow' },
  yellow: { duration: 1000, next: 'red' },
  red: { duration: 4000, next: 'green' },
};

const LAMPS = ['red', 'yellow', 'green'];

// TODO: cycle through the config with timers, pause/resume, accessible name.
export function TrafficLight({ config = DEFAULT_CONFIG, initial = 'green' }) {
  return (
    <div className="traffic">
      <div className="housing">
        {LAMPS.map((color) => (
          <span key={color} className={`lamp lamp--${color}`} />
        ))}
      </div>
      <button type="button">Pause</button>
    </div>
  );
}

export default function App() {
  return <TrafficLight />;
}
