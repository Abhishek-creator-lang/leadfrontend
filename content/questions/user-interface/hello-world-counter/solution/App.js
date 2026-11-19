import React, { useState } from 'react';
import './styles.css';

const MIN = 0;

export default function App() {
  const [count, setCount] = useState(MIN);

  // Updater functions read the latest state, so rapid clicks or batched calls never lose an update.
  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => Math.max(MIN, c - 1));
  const reset = () => setCount(MIN);

  const atMin = count === MIN;

  return (
    <main className="counter">
      <h1>Counter</h1>
      <p className="counter-value" role="status">
        {count}
      </p>
      <div className="counter-actions">
        <button type="button" aria-label="Decrement" onClick={decrement} disabled={atMin}>
          −
        </button>
        <button type="button" aria-label="Increment" onClick={increment}>
          +
        </button>
        <button type="button" onClick={reset} disabled={atMin}>
          Reset
        </button>
      </div>
    </main>
  );
}
