import React from 'react';
import { WORDS } from './words';
import './styles.css';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const KEY_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
];

// TODO: return 'correct' | 'present' | 'absent' for each letter, handling duplicates.
export function scoreGuess(guess, answer) {
  return Array(WORD_LENGTH).fill('absent');
}

// TODO:
// - track submitted guesses and the current row
// - physical keyboard (window keydown) + on-screen keyboard
// - validation messages, win / loss, Play again
// - accessible tile and key states
export function Wordle({ answer, words }) {
  const rows = Array.from({ length: MAX_GUESSES }, () => Array(WORD_LENGTH).fill(''));

  return (
    <main className="wordle">
      <h1>Wordle</h1>
      <div className="board">
        {rows.map((letters, r) => (
          <div className="row" key={r}>
            {letters.map((letter, i) => (
              <div className="tile" key={i}>
                {letter}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="keyboard">
        {KEY_ROWS.map((row, i) => (
          <div className="key-row" key={i}>
            {row.map((key) => (
              <button type="button" className="key" key={key}>
                {key === 'Backspace' ? '⌫' : key.toUpperCase()}
              </button>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}

export default function App() {
  const answer = WORDS[Math.floor(Math.random() * WORDS.length)];
  return <Wordle answer={answer} words={WORDS} />;
}
