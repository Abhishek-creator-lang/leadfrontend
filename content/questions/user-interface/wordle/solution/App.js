import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { WORDS } from './words';
import './styles.css';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const KEY_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
];
const RANK = { absent: 1, present: 2, correct: 3 };

/**
 * Two passes so duplicate letters are scored like the real game:
 * 1. exact matches claim their answer letter first;
 * 2. remaining guess letters are "present" only while unclaimed copies are left.
 */
export function scoreGuess(guess, answer) {
  const result = Array(guess.length).fill('absent');
  const remaining = {};

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === answer[i]) result[i] = 'correct';
    else remaining[answer[i]] = (remaining[answer[i]] || 0) + 1;
  }
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'correct') continue;
    const letter = guess[i];
    if (remaining[letter] > 0) {
      result[i] = 'present';
      remaining[letter] -= 1;
    }
  }
  return result;
}

function init({ answer, words }) {
  return {
    answer,
    dictionary: new Set(words),
    guesses: [],
    current: '',
    status: 'playing', // 'playing' | 'won' | 'lost'
    message: '',
    messageId: 0,
  };
}

function withMessage(state, message) {
  // A new id re-mounts the alert so repeating the same error is announced again.
  return { ...state, message, messageId: state.messageId + 1 };
}

function reducer(state, action) {
  switch (action.type) {
    case 'key': {
      if (state.status !== 'playing') return state;
      const { key } = action;

      if (key === 'Backspace') {
        return { ...state, current: state.current.slice(0, -1), message: '' };
      }
      if (key === 'Enter') {
        const guess = state.current;
        if (guess.length < WORD_LENGTH) return withMessage(state, 'Not enough letters');
        if (!state.dictionary.has(guess)) return withMessage(state, 'Not in word list');

        const guesses = [...state.guesses, guess];
        let status = 'playing';
        let message = '';
        if (guess === state.answer) {
          status = 'won';
          message = 'You win!';
        } else if (guesses.length === MAX_GUESSES) {
          status = 'lost';
          message = `The word was ${state.answer.toUpperCase()}`;
        }
        return { ...withMessage(state, message), guesses, current: '', status };
      }
      if (state.current.length >= WORD_LENGTH) return state;
      return { ...state, current: state.current + key, message: '' };
    }
    case 'reset':
      return init({ answer: action.answer ?? state.answer, words: state.dictionary });
    default:
      throw new Error(`Unknown action ${action.type}`);
  }
}

function normalizeKey(key) {
  if (key === 'Enter' || key === 'Backspace') return key;
  if (/^[a-z]$/i.test(key)) return key.toLowerCase();
  return null;
}

const STATE_LABEL = { correct: 'correct', present: 'in the word, wrong spot', absent: 'not in the word' };

export function Wordle({ answer, words, onPlayAgain }) {
  const [state, dispatch] = useReducer(reducer, { answer, words }, init);
  const { guesses, current, status, message, messageId } = state;
  const playAgainRef = useRef(null);

  // Physical keyboard. `dispatch` is stable, so we subscribe once and never read stale state.
  useEffect(() => {
    function onKeyDown(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      if (target instanceof Element) {
        if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
        // A focused <button> already turns Enter into a click. Handling it here too would submit twice.
        if (event.key === 'Enter' && target.closest('button')) return;
      }
      const key = normalizeKey(event.key);
      if (!key) return;
      event.preventDefault();
      dispatch({ type: 'key', key });
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // When the game ends, move focus to the next useful action.
  useEffect(() => {
    if (status !== 'playing') playAgainRef.current?.focus();
  }, [status]);

  const evaluations = useMemo(() => guesses.map((g) => scoreGuess(g, answer)), [guesses, answer]);

  const keyStates = useMemo(() => {
    const best = {};
    guesses.forEach((guess, g) => {
      [...guess].forEach((letter, i) => {
        const next = evaluations[g][i];
        if (!best[letter] || RANK[next] > RANK[best[letter]]) best[letter] = next;
      });
    });
    return best;
  }, [guesses, evaluations]);

  const rows = [];
  for (let r = 0; r < MAX_GUESSES; r++) {
    let letters = '';
    let scores = null;
    if (r < guesses.length) {
      letters = guesses[r];
      scores = evaluations[r];
    } else if (r === guesses.length && status === 'playing') {
      letters = current;
    }
    rows.push(
      <div role="group" aria-label={`Guess ${r + 1}`} className="row" key={r}>
        {Array.from({ length: WORD_LENGTH }, (_, i) => {
          const letter = letters[i] ?? '';
          const tileState = scores ? scores[i] : letter ? 'filled' : 'empty';
          return (
            <div className="tile" data-state={tileState} style={{ '--i': i }} key={i}>
              {letter}
              {scores && <span className="sr-only">, {STATE_LABEL[scores[i]]}</span>}
            </div>
          );
        })}
      </div>
    );
  }

  function playAgain() {
    if (onPlayAgain) onPlayAgain();
    else dispatch({ type: 'reset' });
  }

  return (
    <main className="wordle">
      <h1>Wordle</h1>

      <div className="message-slot">
        <p role="alert" className={message ? 'message' : undefined} key={messageId}>
          {message}
        </p>
      </div>

      <div className="board">{rows}</div>

      {status !== 'playing' && (
        <button ref={playAgainRef} type="button" className="play-again" onClick={playAgain}>
          Play again
        </button>
      )}

      <div className="keyboard" aria-label="Keyboard" role="group">
        {KEY_ROWS.map((row, i) => (
          <div className="key-row" key={i}>
            {row.map((key) => {
              const keyState = keyStates[key];
              const label =
                key === 'Backspace' ? 'Backspace' : key === 'Enter' ? 'Enter' : key.toUpperCase();
              return (
                <button
                  type="button"
                  key={key}
                  className={`key${key.length > 1 ? ' key--wide' : ''}`}
                  data-state={keyState}
                  aria-label={keyState ? `${label}, ${keyState}` : label}
                  // Keep focus where it was on mouse clicks, so a physical Enter afterwards
                  // submits the guess instead of re-pressing the last clicked key.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => dispatch({ type: 'key', key })}
                >
                  {key === 'Backspace' ? '⌫' : label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </main>
  );
}

function pickAnswer(previous) {
  let next;
  do {
    next = WORDS[Math.floor(Math.random() * WORDS.length)];
  } while (next === previous && WORDS.length > 1);
  return next;
}

export default function App() {
  const [game, setGame] = useState(() => ({ id: 0, answer: pickAnswer() }));
  return (
    <Wordle
      // A new key remounts <Wordle>, which resets all of its state in one go.
      key={game.id}
      answer={game.answer}
      words={WORDS}
      onPlayAgain={() => setGame((g) => ({ id: g.id + 1, answer: pickAnswer(g.answer) }))}
    />
  );
}
