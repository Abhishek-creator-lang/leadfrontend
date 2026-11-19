## State design

| State | Shape | Notes |
|---|---|---|
| `deck` | `[{ id, name, emoji }]` | Built once per game. Stable `id`s (`Apple-a`, `Apple-b`) make good React keys. Don't use the index, because the deck reshuffles. |
| `flipped` | indices, length 0–2 | Face-up cards that aren't matched yet |
| `matched` | `Set` of symbol names | Matched cards are derived as `matched.has(card.name)` |
| `moves` | number | Counted when the *second* card of a turn is revealed |
| `announcement` | string | Text for the live region |

`won` is derived (`matched.size === symbols.length`). Whether a card is face up is derived from `flipped` and `matched`, so there's no per-card `isFlipped` flag to keep in sync.

## The timer is an effect of the state, not of the click

The tempting implementation is `setTimeout(() => setFlipped([]), 1000)` inside the click handler. It has three bugs:

1. If the user clicks a third card early, the old timeout still fires later and hides the **new** card.
2. Clicking **New game** during the delay lets the stale timeout run against the new game.
3. Unmounting during the delay calls `setState` on an unmounted component.

The solution says it declaratively instead: *"while two unmatched cards are face up, schedule a flip-back."*

```js
useEffect(() => {
  if (flipped.length !== 2) return;
  const t = setTimeout(() => setFlipped([]), mismatchDelay);
  return () => clearTimeout(t);
}, [flipped, mismatchDelay]);
```

Whenever `flipped` changes (third click, reset) or the component unmounts, React runs the cleanup and the pending timer is cancelled. All three bugs disappear, and it behaves correctly under Strict Mode's double-invoked effects.

**Not blocking input** (requirement 4) is a UX choice that strong candidates raise themselves. Many implementations lock the board during the delay, which feels sluggish. Here a click while two cards are showing simply starts a new turn.

## Shuffling

`array.sort(() => Math.random() - 0.5)` is a well-known **biased** shuffle: the comparator isn't consistent, and engines' sort algorithms don't produce uniform permutations from it. Fisher–Yates is O(n) and uniform. Injecting `shuffle` as a prop makes the game deterministic in tests, which is the same dependency-injection idea as passing a clock or a random function.

## Accessibility

- Cards are real `<button>`s in a list. The accessible name carries both position and state (`Card 3, face down` → `Card 3, Pear` → `Card 3, Pear, matched`).
- The symbol only exists in the DOM while the card is face up. A common leak is rendering the emoji on the hidden back face with CSS `backface-visibility`: it's invisible, but screen readers, or anyone using *Inspect element*, can read it.
- A visually hidden `role="status"` region announces the outcome of each turn ("No match: Apple and Pear"). Changing the focused button's label isn't reliably re-announced by screen readers, so the live region is the dependable channel.
- Face-up cards use `aria-disabled` rather than `disabled`, so focus isn't lost from the button the user just activated.
- The flip animation is purely CSS (`transform: rotateY`, compositor-friendly) and is turned off under `prefers-reduced-motion`.

## Edge cases

- Double-clicking a card counts as a no-op, not as a match with itself (`flipped.includes(index)`).
- Clicking matched cards, or any card after winning, is ignored.
- An odd number of cards can't happen, because the deck is built from pairs. If cards come from an API, validate it.
- If `mismatchDelay` changes mid-game, the effect restarts with the new delay.

## Scaling and productionising

- **Larger boards:** with 100+ cards, memoise a `Card` component and pass primitive props (`label`, `isUp`, `isMatched`, `emoji`), so a flip re-renders two cards, not all of them.
- **Images instead of emoji:** preload the face images (`new Image().src = …`) when the game starts, so the first flip doesn't show a blank face while the image downloads.
- **Persistence:** save `{ deckIds, matched, moves }` to `localStorage` so a refresh resumes the game. Keep best scores per board size.
- **Timer and score:** start the clock on the first flip and stop it on win. Derive elapsed time from `Date.now() - startedAt` instead of counting interval ticks, because background tabs throttle intervals.

## Follow-ups

- **Arrow-key navigation:** convert to `role="grid"` with a roving tabindex (see the tic-tac-toe question).
- **Animations on mobile:** animate only `transform` and `opacity`, add `will-change: transform` sparingly, and avoid animating `box-shadow` or layout properties.
- **Multiplayer turns:** add `currentPlayer` and per-player scores. A match keeps the turn and a mismatch passes it on, which is a natural fit for `useReducer`.
