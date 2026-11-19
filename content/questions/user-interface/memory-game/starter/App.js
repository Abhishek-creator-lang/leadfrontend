import React from 'react';
import './styles.css';

export const SYMBOLS = [
  { name: 'Apple', emoji: '🍎' },
  { name: 'Banana', emoji: '🍌' },
  { name: 'Cherry', emoji: '🍒' },
  { name: 'Grapes', emoji: '🍇' },
  { name: 'Lemon', emoji: '🍋' },
  { name: 'Peach', emoji: '🍑' },
  { name: 'Pear', emoji: '🍐' },
  { name: 'Melon', emoji: '🍉' },
];

// TODO: implement an unbiased shuffle (returns a new array).
export function shuffleArray(items) {
  return items.slice();
}

// TODO:
// - build a deck with two cards per symbol and shuffle it
// - flip / match / mismatch logic with a timed flip-back (mismatchDelay)
// - move counter, win message, New game
// - accessible card names and a status live region
export function MemoryGame({ symbols = SYMBOLS, shuffle = shuffleArray, mismatchDelay = 1000 }) {
  const deck = symbols.flatMap((symbol) => [symbol, symbol]);

  return (
    <main className="memory">
      <h1>Memory</h1>
      <p className="moves">Moves: 0</p>
      <div className="grid">
        {deck.map((card, index) => (
          <button key={index} type="button" className="card">
            ?
          </button>
        ))}
      </div>
    </main>
  );
}

export default function App() {
  return <MemoryGame />;
}
