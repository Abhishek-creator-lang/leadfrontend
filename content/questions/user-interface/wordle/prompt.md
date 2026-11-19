Build a **Wordle**-style word game. The player has **six attempts** to guess a hidden five-letter word. After each guess, every letter is marked as:

- **correct**: right letter, right position (green)
- **present**: the letter is in the word but in a different position (yellow)
- **absent**: the letter isn't in the word, or all copies of it are already accounted for (grey)

The starter renders the empty 6 × 5 board and an on-screen keyboard, and exports a stub `scoreGuess`. `words.js` has a small dictionary that stands in for the real word list.

## API

```js
export function scoreGuess(guess, answer) // → ['correct' | 'present' | 'absent', …] (length 5)
export function Wordle({ answer, words })  // answer: lower-case string; words: allowed guesses
export default function App()              // picks a random answer and renders <Wordle />
```

## Requirements

1. **Input** from both the physical keyboard (letters, <kbd>Enter</kbd>, <kbd>Backspace</kbd>) and the on-screen keyboard. Ignore key presses with <kbd>Ctrl</kbd>/<kbd>Meta</kbd>/<kbd>Alt</kbd> held. Pressing <kbd>Enter</kbd> while an on-screen key has focus must not submit twice.
2. Typing fills the current row, at most 5 letters. <kbd>Backspace</kbd> removes the last letter.
3. <kbd>Enter</kbd> submits:
   - fewer than 5 letters: show `Not enough letters`
   - a word that isn't in `words`: show `Not in word list`, and the row stays editable
   - otherwise, score the guess and move to the next row.
4. **Duplicate letters** must be scored like the real game. With answer `crane`, the guess `eerie` scores `absent, absent, present, absent, correct`. Only one `e` exists, and the exact match claims it.
5. On-screen keys show the **best** state known for each letter (correct beats present, which beats absent).
6. Guessing the word shows `You win!`. Using all six guesses shows `The word was CRANE`. Either way, input stops and a **Play again** button appears.
7. Accessibility:
   - Messages (errors, win or loss) are announced (`role="alert"`).
   - Colour isn't the only signal: each scored tile and each on-screen key exposes its state in text. For example, a key is named `A, correct`.
   - Each board row is a labelled group (`Guess 1` … `Guess 6`).

## Follow-up

- Add tile flip animations that respect `prefers-reduced-motion`.
- "Hard mode": revealed hints must be used in later guesses.
- How would you ship a 13,000-word dictionary without bloating the bundle, and validate guesses without exposing the answer?
