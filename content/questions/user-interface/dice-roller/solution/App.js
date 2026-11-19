import React, { useRef, useState } from 'react';
import './styles.css';

// `random` is injectable so tests (or a seeded PRNG) can make rolls deterministic.
export function rollDice(count, random = Math.random) {
  return Array.from({ length: count }, () => Math.floor(random() * 6) + 1);
}

function parseCount(raw) {
  const s = String(raw).trim();
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  return n >= 1 && n <= 12 ? n : null;
}

function Die({ value }) {
  return (
    <li>
      <div className="die" data-value={value} role="img" aria-label={`Die showing ${value}`}>
        {Array.from({ length: value }, (_, i) => (
          <span key={i} className="pip" />
        ))}
      </div>
    </li>
  );
}

export default function App() {
  const [rolls, setRolls] = useState(null); // { id, values }
  const [error, setError] = useState(null);
  const rollId = useRef(0);

  function handleSubmit(event) {
    event.preventDefault();
    const count = parseCount(new FormData(event.currentTarget).get('count'));
    if (count === null) {
      setError('Choose a whole number of dice from 1 to 12.');
      return;
    }
    setError(null);
    // A new id per roll re-mounts the dice, which replays the CSS animation even for identical values.
    rollId.current += 1;
    setRolls({ id: rollId.current, values: rollDice(count) });
  }

  const total = rolls ? rolls.values.reduce((a, b) => a + b, 0) : 0;

  return (
    <main className="roller">
      <h1>Dice roller</h1>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="count">Number of dice</label>
        <input
          id="count"
          name="count"
          inputMode="numeric"
          defaultValue="3"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'count-error' : undefined}
        />
        <button type="submit">Roll</button>
        {error && (
          <p id="count-error" className="error">
            {error}
          </p>
        )}
      </form>

      {rolls ? (
        <>
          <ul className="dice" aria-label="Dice">
            {rolls.values.map((value, i) => (
              <Die key={`${rolls.id}-${i}`} value={value} />
            ))}
          </ul>
          <p className="total" aria-hidden="true">
            Total: {total}
          </p>
        </>
      ) : (
        <p className="hint">Choose how many dice and press Roll</p>
      )}

      {/* Always mounted, so the announcement fires reliably on each roll. */}
      <p role="status" className="visually-hidden">
        {rolls &&
          `Rolled ${rolls.values.length} ${rolls.values.length === 1 ? 'die' : 'dice'}: ${rolls.values.join(', ')}. Total ${total}.`}
      </p>
    </main>
  );
}
