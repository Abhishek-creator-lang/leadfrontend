import React from 'react';
import './styles.css';

// TODO: validate the count, roll the dice, render pip faces, show and announce the total.
export default function App() {
  return (
    <main className="roller">
      <h1>Dice roller</h1>
      <form className="form">
        <label htmlFor="count">Number of dice</label>
        <input id="count" name="count" inputMode="numeric" defaultValue="3" />
        <button type="submit">Roll</button>
      </form>
      <p className="hint">Choose how many dice and press Roll</p>
    </main>
  );
}
