import React from 'react';
import './styles.css';

// TODO: keep the inputs in sync, round to 4 decimals, handle invalid and empty input.
export default function App() {
  return (
    <main className="converter">
      <h1>Temperature converter</h1>
      <div className="fields">
        <div className="field">
          <label htmlFor="celsius">Celsius</label>
          <input id="celsius" />
        </div>
        <span className="equals" aria-hidden="true">=</span>
        <div className="field">
          <label htmlFor="fahrenheit">Fahrenheit</label>
          <input id="fahrenheit" />
        </div>
      </div>
    </main>
  );
}
