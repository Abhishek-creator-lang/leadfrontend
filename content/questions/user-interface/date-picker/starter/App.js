import React, { useState } from 'react';
import './styles.css';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// TODO:
// - parse / format YYYY-MM-DD in local time; validate typed input
// - open a modal dialog with month navigation and a role="grid" calendar
// - roving focus + the full APG keyboard model, Enter selects, Escape / Cancel / outside click close
// - aria-selected, aria-current="date", full-date names, focus trap and focus return
export function DatePicker({ value, onChange, label = 'Date', today = new Date(), locale = 'en-US' }) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="date-picker">
      <label>
        {label}
        <input type="text" defaultValue={value} />
      </label>
      <button type="button">📅</button>
      <div className="calendar">
        <h2>March 2026</h2>
        <table>
          <thead>
            <tr>
              {WEEKDAYS.map((d) => (
                <th key={d}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {days.slice(0, 7).map((d) => (
                <td key={d}>{d}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function App() {
  const [date, setDate] = useState('');
  return (
    <main>
      <h1>Book a meeting</h1>
      <DatePicker value={date} onChange={setDate} label="Meeting date" />
    </main>
  );
}
