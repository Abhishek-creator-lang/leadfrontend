## Architecture

```
App                 picks the answer, remounts <Wordle key={id}> for "Play again"
└─ Wordle           useReducer game state + window keydown subscription
   ├─ board         6 × role="group" rows of tiles (derived from guesses/current)
   ├─ alert         messages (errors, win/loss)
   └─ keyboard      on-screen keys, coloured by derived keyStates
scoreGuess()        pure function: the interesting algorithm
```

## The scoring algorithm (duplicates are the whole question)

A naive `answer.includes(letter) ? 'present' : 'absent'` gets duplicates wrong. With answer `crane` and guess `eerie`, it marks all three `e`s yellow or green, even though the answer has only one `e`.

The correct algorithm makes **two passes** with a letter budget:

1. Mark exact matches `correct`. Every *unmatched* answer letter goes into a count map (`remaining`).
2. For each guess letter that isn't already correct, mark it `present` only if `remaining[letter] > 0`, and decrement the count. Otherwise it's `absent`.

Exact matches must claim their letter **before** any "present" letters, which is why a single pass fails: in `eerie` vs `crane`, the last `e` is correct, so the earlier `e`s must be absent. The cost is O(L) time and O(alphabet) space. Because `scoreGuess` is pure, it gets unit tests of its own. Test the tricky cases (`eerie/crane`, `apple/paper`) in isolation rather than through the UI.

## State design

`useReducer` holds `{ answer, dictionary, guesses[], current, status, message, messageId }`. Everything else is **derived**:

- **Tile scores**: `useMemo(() => guesses.map(g => scoreGuess(g, answer)))`. We store guesses, not colours.
- **Keyboard colours**: fold over the evaluations, keeping the best rank per letter (`correct > present > absent`). A letter that was yellow and later green must stay green, even if a later guess shows it as absent in another position.
- **Rows to render**: submitted guesses, then `current` (only while playing), then empty rows.

Why a reducer? The keyboard handler is subscribed **once** on `window`. With `useState` setters inside that listener, you'd read stale `current`/`guesses` from the closure of the first render, or you'd re-subscribe on every keystroke. Dispatching an intent (`{ type: 'key', key }`) moves all the logic into the reducer, which always sees the latest state, and `dispatch` is stable, so the effect has no dependencies. That's the cleanest answer to "stale closure in an event listener".

**Resetting:** "Play again" changes the `key` on `<Wordle>`. Remounting throws away all state in one step, so there's no risk of forgetting a field in a manual reset. A `reset` action exists for when the component is used on its own.

## Input handling details that interviewers probe

- **Modifier keys:** <kbd>Ctrl</kbd>+<kbd>R</kbd> must reload the page, not type `r`. Bail out on `ctrlKey`/`metaKey`/`altKey`.
- **Double submit:** if an on-screen button has focus, a physical <kbd>Enter</kbd> fires *both* the window `keydown` and a synthetic `click` on the button. The listener ignores <kbd>Enter</kbd> whose target is a button.
- **The "last clicked key" problem:** after clicking the on-screen `M`, focus stays on that button, so a physical <kbd>Enter</kbd> would press `M` again. `onMouseDown={e => e.preventDefault()}` stops mouse clicks from moving focus. Keyboard users who <kbd>Tab</kbd> to a key still get normal button behaviour.
- **Form fields elsewhere on the page:** ignore events from `input`, `textarea` and `contenteditable`.
- **Cleanup:** the effect removes its listener. Without that, Strict Mode's double-invoked effects and every remount stack up extra listeners, and each key press then dispatches twice.

## Accessibility

- **Colour isn't the only signal.** Scored tiles include visually hidden text ("in the word, wrong spot"), and keys get `aria-label="A, correct"`. This is WCAG 1.4.1 (Use of Color). The palette also keeps white text at ≥ 4.5:1 contrast. A high-contrast or colour-blind theme (orange/blue) is a common follow-up.
- **Announcements:** errors and the result go in a `role="alert"` element. Re-mounting it with a `messageId` key makes a repeated "Not enough letters" announce again. Otherwise the text doesn't change, and screen readers stay silent.
- **Structure:** each row is `role="group"` labelled `Guess n`, so screen-reader users can review earlier guesses.
- **Focus:** when the game ends, focus moves to **Play again**.
- **Motion:** the flip animation is staggered with a CSS variable (`--i`) and turned off under `prefers-reduced-motion`.

## Productionising

- **Dictionary size:** the real list (~13k guesses, ~2.3k answers) is ~70 KB raw. Lazy-load it after first paint (`import('./words')`), or store it as a compact trie or bitset. Validation can also be a server call.
- **Don't ship the answer:** in a client-only game, the answer is in the bundle. A competitive version keeps it on the server: `POST /guess` returns the scores, and the server enforces the 6-guess limit and the daily seed.
- **Daily puzzle:** derive the index from the date in a fixed timezone. Persist `{ date, guesses }` in `localStorage` so a refresh restores the game. Store guesses, not colours, and re-score them on load.
- **Stats and sharing:** streaks, a distribution histogram, and the emoji grid built from evaluations.

## Edge cases

- Typing more than 5 letters is ignored. <kbd>Backspace</kbd> on an empty row is a no-op.
- An invalid word keeps the row editable and doesn't use up a guess.
- The answer appears in the "word was" message in upper case, matching the tiles' `text-transform`.
- After the game ends, all input is ignored, including the on-screen keyboard.

## Follow-ups

- **Hard mode:** validate that each new guess keeps every green letter in place and includes every yellow letter. That's an extra check in the reducer's `Enter` branch.
- **Variable word length:** replace the `WORD_LENGTH` constant with a prop. `scoreGuess` already works for any length.
- **Testing:** unit-test `scoreGuess`. For the UI, drive it with `keyDown` on `window` and on-screen clicks, then assert on `data-state` and accessible names, not on colours.
