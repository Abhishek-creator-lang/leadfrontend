import React, { useEffect, useRef, useState } from 'react';
import './styles.css';

/** Picks 1–2 distinct hole indices. */
export function pickMoles(holes, random) {
  const count = random() < 0.7 ? 1 : 2;
  const result = new Set();
  while (result.size < Math.min(count, holes)) {
    result.add(Math.floor(random() * holes));
  }
  return result;
}

export function WhackAMole({ holes = 9, duration = 15000, moleInterval = 900, random = Math.random }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'playing' | 'over'
  const [moles, setMoles] = useState(() => new Set());
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);

  // Keep the latest `random` without restarting the timers when the parent passes a new function.
  const randomRef = useRef(random);
  useEffect(() => {
    randomRef.current = random;
  });

  const isPlaying = status === 'playing';

  // All round timers live in one effect keyed on `isPlaying`. Ending the round (or unmounting)
  // runs the cleanup, so no interval can outlive the game.
  useEffect(() => {
    if (!isPlaying) return undefined;
    const endsAt = Date.now() + duration;

    setMoles(pickMoles(holes, randomRef.current));
    const spawner = setInterval(() => setMoles(pickMoles(holes, randomRef.current)), moleInterval);

    // Derive remaining time from the clock instead of counting ticks, so it never drifts.
    const clock = setInterval(() => setTimeLeft(Math.max(0, endsAt - Date.now())), 250);

    const end = setTimeout(() => {
      setStatus('over');
      setMoles(new Set());
      setTimeLeft(0);
    }, duration);

    return () => {
      clearInterval(spawner);
      clearInterval(clock);
      clearTimeout(end);
    };
  }, [isPlaying, duration, holes, moleInterval]);

  function whack(index) {
    // Read `moles` from this render. React re-renders between discrete events (clicks, keys),
    // so a second hit on the same mole sees it already gone. Updaters stay pure: no setState
    // inside another updater, which Strict Mode would run twice.
    if (!isPlaying || !moles.has(index)) return;
    setMoles((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
    setScore((s) => s + 1);
  }

  // The window listener is bound once per round and always calls the latest `whack`
  // through a ref, so it never sees stale `moles`.
  const whackRef = useRef(whack);
  useEffect(() => {
    whackRef.current = whack;
  });

  useEffect(() => {
    if (!isPlaying) return undefined;
    function onKeyDown(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const n = Number(event.key);
      if (Number.isInteger(n) && n >= 1 && n <= holes) {
        event.preventDefault();
        whackRef.current(n - 1);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPlaying, holes]);

  function start() {
    setScore(0);
    setTimeLeft(duration);
    setStatus('playing');
  }

  return (
    <main className="whack">
      <h1>Whack-a-Mole</h1>
      <div className="hud">
        <span>Score: {score}</span>
        <span>Time left: {Math.ceil(timeLeft / 1000)}s</span>
      </div>

      <div className="field" role="group" aria-label="Mole holes">
        {Array.from({ length: holes }, (_, i) => {
          const hasMole = moles.has(i);
          return (
            <button
              key={i}
              type="button"
              className={`hole${hasMole ? ' hole--up' : ''}`}
              aria-label={`Hole ${i + 1}, ${hasMole ? 'mole' : 'empty'}`}
              aria-disabled={!isPlaying}
              aria-keyshortcuts={i < 9 ? String(i + 1) : undefined}
              // Hit on pointer down: a full click (down + up) feels laggy in a reaction game.
              onPointerDown={(e) => {
                if (e.button === 0) whack(i);
              }}
              // Keyboard activation (Enter / Space) still arrives as a click with detail 0.
              onClick={(e) => {
                if (e.detail === 0) whack(i);
              }}
            >
              <span className="mole" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <p role="status" className="result">
        {status === 'over' ? `Time's up! Final score: ${score}` : ''}
      </p>

      <button type="button" className="start" onClick={start} disabled={isPlaying}>
        {status === 'idle' ? 'Start game' : isPlaying ? 'Playing…' : 'Play again'}
      </button>
    </main>
  );
}

export default function App() {
  return <WhackAMole />;
}
