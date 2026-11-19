import React from 'react';
import './styles.css';

// TODO: keep the current time in state, tick every second (aligned to the second boundary),
// format HH:MM:SS, add a 12/24-hour toggle and the date.
export default function App() {
  return (
    <main className="clock">
      <div className="clock-face">--:--:--</div>
      <button type="button" className="clock-toggle">
        24-hour
      </button>
    </main>
  );
}
