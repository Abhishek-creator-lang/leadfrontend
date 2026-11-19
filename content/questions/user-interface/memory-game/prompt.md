Build a **memory (concentration) game**. A grid of face-down cards holds pairs of symbols. The player turns over two cards per move. A matching pair stays face up. A mismatched pair is shown briefly, then turns back over.

The starter renders a grid of face-down cards from `SYMBOLS` and exports a `MemoryGame` component.

## API

```js
export function MemoryGame({
  symbols = SYMBOLS,          // [{ name: 'Apple', emoji: '🍎' }, …], one entry per pair
  shuffle = shuffleArray,     // (cards) => shuffled copy; tests pass an identity function
  mismatchDelay = 1000,       // ms a mismatched pair stays visible
})
```

## Requirements

1. The deck holds two cards per symbol, shuffled. Write an **unbiased** shuffle.
2. Clicking a face-down card turns it over. Clicking a face-up or matched card does nothing.
3. When a second card is turned:
   - **Match:** both stay face up and are marked as matched.
   - **Mismatch:** both stay visible for `mismatchDelay` ms, then turn back over.
   - Either way, the **move counter** goes up by one.
4. If the player clicks a third card while a mismatched pair is still showing, turn the pair back over immediately and flip the new card. Don't make players wait.
5. When every pair is matched, show `You found all N pairs in M moves!` and a **New game** button that reshuffles.
6. Accessibility:
   - Each card is a button named by position and state: `Card 3, face down`, `Card 3, Apple` or `Card 3, Apple, matched`.
   - Results ("Match: Apple" / "No match: Apple and Pear") and the final message are announced through a `role="status"` region.
   - Don't leak face-down symbols to assistive tech, for example via `alt` text or hidden DOM.
7. Clean up the flip-back timer when the component unmounts or the game resets.

## Follow-up

- Add a timer and a best-score record that persists across reloads.
- Arrow-key navigation over the grid (roving tabindex).
- The 3D flip is janky on low-end phones. Why, and how would you animate it?
