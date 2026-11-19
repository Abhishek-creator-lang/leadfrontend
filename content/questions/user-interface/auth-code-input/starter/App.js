import React, { useState } from 'react';
import './styles.css';

const LENGTH = 6;

// TODO:
// - keep the digits in state and accept digits only
// - auto-advance on input, Backspace goes back, arrow/Home/End navigation
// - paste distributes digits across the boxes
// - label the group and each box ("Digit 1 of 6"), numeric keypad, OTP autofill
export function AuthCodeInput() {
  return (
    <div className="code-input">
      {Array.from({ length: LENGTH }, (_, i) => (
        <input key={i} className="code-box" type="text" />
      ))}
    </div>
  );
}

export default function App() {
  const [status, setStatus] = useState('');

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault();
        setStatus('TODO');
      }}
    >
      <h1>Check your phone</h1>
      <p>Enter the 6-digit code we sent you.</p>
      <AuthCodeInput />
      <button type="submit" className="primary">
        Verify
      </button>
      <p>{status}</p>
    </form>
  );
}
