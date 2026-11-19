import React, { useEffect, useState } from 'react';
import './styles.css';

export const CONFIG = [
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 1],
];

export function GridLights({ config = CONFIG, delay = 300 }) {
  // Activation order is the only real state. "Is this light on?" is `order.includes(index)`.
  const [order, setOrder] = useState([]);
  const [deactivating, setDeactivating] = useState(false);

  const columns = config[0].length;
  const cells = config.flat();
  const lightCount = cells.filter(Boolean).length;

  // One timeout per step. The effect re-runs whenever `order` shrinks, so each step reads the
  // current order. Cleanup cancels the pending step on unmount or if `delay` changes.
  useEffect(() => {
    if (!deactivating) return undefined;
    const timer = setTimeout(() => {
      const next = order.slice(0, -1);
      setOrder(next);
      if (next.length === 0) setDeactivating(false);
    }, delay);
    return () => clearTimeout(timer);
  }, [deactivating, order, delay]);

  function activate(index) {
    if (deactivating || order.includes(index)) return;
    const next = [...order, index];
    setOrder(next);
    if (next.length === lightCount) setDeactivating(true);
  }

  return (
    <>
      <div
        className="grid"
        role="group"
        aria-label="Lights"
        style={{ gridTemplateColumns: `repeat(${columns}, 64px)` }}
      >
        {cells.map((cell, index) => {
          if (!cell) return <span key={index} className="gap" aria-hidden="true" />;
          const isOn = order.includes(index);
          const row = Math.floor(index / columns) + 1;
          const col = (index % columns) + 1;
          return (
            <button
              key={index}
              type="button"
              className="light"
              aria-label={`Light at row ${row}, column ${col}`}
              aria-pressed={isOn}
              aria-disabled={deactivating || isOn}
              onClick={() => activate(index)}
            />
          );
        })}
      </div>
      <p role="status" className="sr-only">
        {deactivating ? 'All lights on. Switching off…' : ''}
      </p>
    </>
  );
}

export default function App() {
  return (
    <main>
      <h1>Grid Lights</h1>
      <GridLights />
    </main>
  );
}
