import React, { useEffect, useState } from 'react';
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

// Fisher–Yates: every permutation is equally likely. `sort(() => Math.random() - 0.5)` is biased.
export function shuffleArray(items) {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildDeck(symbols, shuffle) {
  const cards = symbols.flatMap((symbol) => [
    { id: `${symbol.name}-a`, ...symbol },
    { id: `${symbol.name}-b`, ...symbol },
  ]);
  return shuffle(cards);
}

export function MemoryGame({ symbols = SYMBOLS, shuffle = shuffleArray, mismatchDelay = 1000 }) {
  const [deck, setDeck] = useState(() => buildDeck(symbols, shuffle));
  const [flipped, setFlipped] = useState([]); // indices of face-up, unmatched cards (0–2)
  const [matched, setMatched] = useState(() => new Set()); // symbol names
  const [moves, setMoves] = useState(0);
  const [announcement, setAnnouncement] = useState('');

  const pairs = symbols.length;
  const won = matched.size === pairs;

  // A visible mismatched pair flips back after the delay. Cleanup cancels the timer when the pair
  // is resolved early (third click), the game resets, or the component unmounts.
  useEffect(() => {
    if (flipped.length !== 2) return undefined;
    const timer = setTimeout(() => setFlipped([]), mismatchDelay);
    return () => clearTimeout(timer);
  }, [flipped, mismatchDelay]);

  function flip(index) {
    const card = deck[index];
    if (won || matched.has(card.name) || flipped.includes(index)) return;

    // A mismatched pair is still showing: hide it now and start a new turn with this card.
    if (flipped.length !== 1) {
      setFlipped([index]);
      setAnnouncement(card.name);
      return;
    }

    const first = deck[flipped[0]];
    setMoves((m) => m + 1);
    if (first.name === card.name) {
      const nextMatched = new Set(matched).add(card.name);
      setMatched(nextMatched);
      setFlipped([]);
      setAnnouncement(
        nextMatched.size === pairs ? `Match: ${card.name}. You found all ${pairs} pairs!` : `Match: ${card.name}`
      );
    } else {
      setFlipped([flipped[0], index]);
      setAnnouncement(`No match: ${first.name} and ${card.name}`);
    }
  }

  function newGame() {
    setDeck(buildDeck(symbols, shuffle));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setAnnouncement('New game started');
  }

  return (
    <main className="memory">
      <h1>Memory</h1>
      <p className="moves">
        Moves: {moves} · Pairs: {matched.size}/{pairs}
      </p>
      {won && (
        <p className="won">
          You found all {pairs} pairs in {moves} moves!
        </p>
      )}
      <p role="status" className="sr-only">
        {announcement}
      </p>
      <ul className="grid" aria-label="Cards">
        {deck.map((card, index) => {
          const isMatched = matched.has(card.name);
          const isUp = isMatched || flipped.includes(index);
          let label = `Card ${index + 1}, face down`;
          if (isMatched) label = `Card ${index + 1}, ${card.name}, matched`;
          else if (isUp) label = `Card ${index + 1}, ${card.name}`;
          return (
            <li key={card.id}>
              <button
                type="button"
                className={`card${isUp ? ' card--up' : ''}${isMatched ? ' card--matched' : ''}`}
                aria-label={label}
                aria-disabled={isUp}
                onClick={() => flip(index)}
              >
                <span className="card-inner" aria-hidden="true">
                  <span className="card-back">?</span>
                  {/* The symbol is only in the DOM while face up, so it can't leak. */}
                  <span className="card-front">{isUp ? card.emoji : ''}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <button type="button" className="new-game" onClick={newGame}>
        New game
      </button>
    </main>
  );
}

export default function App() {
  return <MemoryGame />;
}
