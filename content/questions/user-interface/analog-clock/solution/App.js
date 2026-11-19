import React, { useEffect, useState } from 'react';
import './styles.css';

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let id;
    const schedule = () => {
      id = setTimeout(() => {
        setNow(new Date());
        schedule();
      }, 1000 - (Date.now() % 1000) + 5);
    };
    schedule();
    return () => clearTimeout(id);
  }, []);
  return now;
}

// Angles in degrees, clockwise from 12 o'clock.
export function handAngles(date) {
  const s = date.getSeconds();
  const m = date.getMinutes() + s / 60;
  const h = (date.getHours() % 12) + m / 60;
  return { hour: h * 30, minute: m * 6, second: s * 6 };
}

const timeLabel = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

const TICKS = Array.from({ length: 12 }, (_, i) => i);

function Hand({ angle, length, tail = 0, className }) {
  return (
    <line
      className={`hand ${className}`}
      x1="100"
      y1={100 + tail}
      x2="100"
      y2={100 - length}
      transform={`rotate(${angle} 100 100)`}
    />
  );
}

export function AnalogClock({ size = 240 }) {
  const now = useNow();
  const { hour, minute, second } = handAngles(now);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className="clock"
      role="img"
      aria-label={`Current time ${timeLabel.format(now)}`}
    >
      {/* Children of role="img" are presentational, so the drawing isn't read out piece by piece. */}
      <circle cx="100" cy="100" r="96" className="clock-face" />
      {TICKS.map((i) => {
        const major = i % 3 === 0;
        return (
          <line
            key={i}
            className={`tick${major ? ' tick--major' : ''}`}
            x1="100"
            y1="10"
            x2="100"
            y2={major ? 24 : 18}
            transform={`rotate(${i * 30} 100 100)`}
          />
        );
      })}
      <Hand className="hand--hour" angle={hour} length={48} />
      <Hand className="hand--minute" angle={minute} length={70} />
      <Hand className="hand--second" angle={second} length={78} tail={14} />
      <circle cx="100" cy="100" r="4" className="hub" />
    </svg>
  );
}

export default function App() {
  return <AnalogClock />;
}
