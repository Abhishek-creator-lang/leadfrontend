import React, { useState } from 'react';
import './styles.css';

const SCALES = {
  celsius: { label: 'Celsius', toC: (v) => v, fromC: (c) => c },
  fahrenheit: { label: 'Fahrenheit', toC: (f) => ((f - 32) * 5) / 9, fromC: (c) => (c * 9) / 5 + 32 },
};

const format = (n) => String(Number(n.toFixed(4)));

// Strict parse: Number('') is 0 and parseFloat('12abc') is 12, so neither is good enough.
function parse(raw) {
  const trimmed = raw.trim();
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(trimmed)) return null;
  return Number(trimmed);
}

export default function App() {
  // The raw text of each field. Only the *other* fields are rewritten on change.
  const [text, setText] = useState({ celsius: '', fahrenheit: '' });
  const [invalid, setInvalid] = useState(null); // key of the field holding unparseable text

  function handleChange(key, raw) {
    if (raw.trim() === '') {
      setText({ celsius: '', fahrenheit: '' });
      setInvalid(null);
      return;
    }
    const value = parse(raw);
    if (value === null) {
      setText((t) => ({ ...t, [key]: raw })); // keep the others as they were
      setInvalid(key);
      return;
    }
    const celsius = SCALES[key].toC(value);
    const next = {};
    for (const k of Object.keys(SCALES)) next[k] = k === key ? raw : format(SCALES[k].fromC(celsius));
    setText(next);
    setInvalid(null);
  }

  return (
    <main className="converter">
      <h1>Temperature converter</h1>
      <div className="fields">
        {Object.entries(SCALES).map(([key, scale], i) => (
          <React.Fragment key={key}>
            {i > 0 && (
              <span className="equals" aria-hidden="true">
                =
              </span>
            )}
            <div className="field">
              <label htmlFor={key}>{scale.label}</label>
              <input
                id={key}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={text[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                aria-invalid={invalid === key ? true : undefined}
                aria-describedby={invalid === key ? `${key}-error` : undefined}
              />
              {invalid === key && (
                <p id={`${key}-error`} className="error">
                  Enter a number, like 21.5 or -4.
                </p>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </main>
  );
}
