import React, { useId, useRef, useState } from 'react';
import './styles.css';

const LENGTH = 6;

/**
 * Controlled code input: `value` is an array of single-character strings ('' = empty box).
 */
export function AuthCodeInput({ value, onChange, labelledBy }) {
  const refs = useRef([]);
  const length = value.length;

  const focusBox = (index) => {
    const el = refs.current[Math.max(0, Math.min(index, length - 1))];
    if (el) {
      el.focus();
      el.select();
    }
  };

  // Writes `chars` starting at `start`, ignoring non-digits. Used for typing, paste and OTP autofill.
  const fill = (start, chars) => {
    const digits = chars.replace(/\D/g, '');
    if (!digits) return;
    const next = [...value];
    let i = start;
    for (const d of digits) {
      if (i >= length) break;
      next[i++] = d;
    }
    onChange(next);
    focusBox(i);
  };

  const clear = (index) => {
    const next = [...value];
    next[index] = '';
    onChange(next);
  };

  const handleChange = (event, index) => {
    const raw = event.target.value;
    if (raw === '') {
      clear(index);
      return;
    }
    const current = value[index];
    // Typing into a filled box (when the caret isn't selecting the digit) yields two chars: keep the new one.
    if (current && raw.length === 2) {
      fill(index, raw[0] === current ? raw[1] : raw[0]);
      return;
    }
    // One char typed, or a whole code autofilled by the OS into this box.
    fill(index, raw);
  };

  const handleKeyDown = (event, index) => {
    switch (event.key) {
      case 'Backspace':
        event.preventDefault();
        if (value[index]) {
          clear(index);
        } else if (index > 0) {
          clear(index - 1);
          focusBox(index - 1);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        focusBox(index - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        focusBox(index + 1);
        break;
      case 'Home':
        event.preventDefault();
        focusBox(0);
        break;
      case 'End':
        event.preventDefault();
        focusBox(length - 1);
        break;
      default:
    }
  };

  const handlePaste = (event, index) => {
    event.preventDefault();
    fill(index, event.clipboardData.getData('text'));
  };

  return (
    <div className="code-input" role="group" aria-labelledby={labelledBy}>
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className="code-box"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1} of ${length}`}
          value={digit}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={(e) => handlePaste(e, i)}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [digits, setDigits] = useState(() => Array(LENGTH).fill(''));
  const [status, setStatus] = useState('');
  const labelId = useId();
  const code = digits.join('');
  const complete = code.length === LENGTH;

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault();
        if (complete) setStatus(`Code ${code} submitted`);
      }}
    >
      <h1>Check your phone</h1>
      <p id={labelId}>Enter the 6-digit code we sent you.</p>
      <AuthCodeInput value={digits} onChange={setDigits} labelledBy={labelId} />
      <button type="submit" className="primary" disabled={!complete}>
        Verify
      </button>
      <p role="status" className="status">
        {status}
      </p>
    </form>
  );
}
