import React, { useEffect, useRef, useState } from 'react';
import './styles.css';

const DEFAULT_CONFIG = {
  green: { duration: 3000, next: 'yellow' },
  yellow: { duration: 1000, next: 'red' },
  red: { duration: 4000, next: 'green' },
};

const LAMP_ORDER = ['red', 'yellow', 'green'];

export function TrafficLight({ config = DEFAULT_CONFIG, initial }) {
  const [light, setLight] = useState(initial ?? Object.keys(config)[0]);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null); // { startedAt, delay } of the running timeout
  const remaining = useRef(null); // ms left when paused; consumed on resume

  useEffect(() => {
    if (paused) return undefined;
    const { duration, next } = config[light];
    const delay = remaining.current ?? duration;
    remaining.current = null;
    timer.current = { startedAt: Date.now(), delay };
    // Chained timeouts (one per state) instead of setInterval: every state can have its own duration.
    const id = setTimeout(() => setLight(next), delay);
    return () => clearTimeout(id);
  }, [light, paused, config]);

  function togglePause() {
    if (!paused && timer.current) {
      const { startedAt, delay } = timer.current;
      remaining.current = Math.max(0, delay - (Date.now() - startedAt));
    }
    setPaused((p) => !p);
  }

  // Lamps: the known colours in physical order, then any custom states.
  const lamps = [
    ...LAMP_ORDER.filter((c) => c in config),
    ...Object.keys(config).filter((c) => !LAMP_ORDER.includes(c)),
  ];

  return (
    <div className="traffic">
      <div className="housing" role="img" aria-label={`Traffic light: ${light}${paused ? ' (paused)' : ''}`}>
        {lamps.map((color) => (
          <span key={color} className={`lamp lamp--${color}${color === light ? ' lamp--on' : ''}`} />
        ))}
      </div>
      <button type="button" onClick={togglePause}>
        {paused ? 'Resume' : 'Pause'}
      </button>
    </div>
  );
}

export default function App() {
  return <TrafficLight />;
}
