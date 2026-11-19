import React, { useEffect, useState } from 'react';
import './styles.css';

const pad = (n) => String(n).padStart(2, '0');

export function formatTime(date, use24h) {
  const h = date.getHours();
  const rest = `${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  if (use24h) return `${pad(h)}:${rest}`;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${rest} ${h < 12 ? 'AM' : 'PM'}`;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'full' });

function useNow() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let id;
    const schedule = () => {
      // Wake up just after the next whole second, so the display flips when the system clock does.
      const delay = 1000 - (Date.now() % 1000) + 5;
      id = setTimeout(() => {
        setNow(new Date());
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(id);
  }, []);

  return now;
}

export default function App() {
  const now = useNow();
  const [use24h, setUse24h] = useState(true);

  return (
    <main className="clock">
      {/* Not a live region: announcing every second would drown out everything else. */}
      <time className="clock-face" dateTime={`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`}>
        {formatTime(now, use24h)}
      </time>
      <p className="clock-date">{dateFormatter.format(now)}</p>
      <button type="button" className="clock-toggle" aria-pressed={use24h} onClick={() => setUse24h((v) => !v)}>
        24-hour
      </button>
    </main>
  );
}
