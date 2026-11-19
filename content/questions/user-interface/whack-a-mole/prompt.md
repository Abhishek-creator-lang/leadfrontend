Build a **whack-a-mole** game. A 3 × 3 field of holes is shown. While the game runs, moles pop up in random holes, and the player scores a point for each mole they hit before it disappears.

The starter renders the static field, a score and a **Start game** button, and exports a `WhackAMole` component.

## API

```js
export function WhackAMole({
  holes = 9,
  duration = 15000,     // length of one game in ms
  moleInterval = 900,   // how often a new set of moles appears
  random = Math.random, // injectable for deterministic tests
})
```

## Requirements

1. **Start game** begins a round: the score resets, moles appear **immediately**, and a new random set of 1–2 moles replaces the old set every `moleInterval` ms.
2. Hitting a hole that has a mole adds 1 to the score, and that mole disappears at once, so it can't be hit twice. Hitting an empty hole does nothing.
3. Show the **time left** in whole seconds, counting down while the round runs.
4. After `duration` ms the round ends: all moles disappear, the holes stop responding, and `Time's up! Final score: N` appears. The button then reads **Play again**.
5. Every timer must be cleaned up when the round ends or the component unmounts. Leaked intervals keep moving moles after the game is over.
6. Accessibility:
   - Each hole is a button named `Hole 3, mole` or `Hole 3, empty`.
   - Keys <kbd>1</kbd>–<kbd>9</kbd> hit the matching hole (laid out like a phone keypad: 1–3 on the top row), so keyboard users can play at speed.
   - The final result is announced (`role="status"`).
   - Respect `prefers-reduced-motion` for the pop-up animation.

## Follow-up

- Moles that stay up for a random, shrinking time as the game goes on.
- Why does a countdown built from `setInterval(…, 1000)` drift, and how do you make it accurate?
- What happens to your timers when the tab is in the background?
