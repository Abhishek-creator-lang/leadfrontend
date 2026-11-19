## State design

| State | Why it's state |
|---|---|
| `status`: `'idle' \| 'playing' \| 'over'` | Drives the timers, the button label and whether hits count |
| `moles`: `Set<number>` | Holes that currently have a mole |
| `score` | |
| `timeLeft` (ms) | Display only. The source of truth is the `endsAt` timestamp inside the effect. |

A status enum beats two booleans (`isPlaying`, `isOver`), because it rules out impossible combinations like "playing and over".

## One effect owns the round

The core of this question is **timer hygiene**. There are three timers: the mole spawner (`setInterval`), the countdown display (`setInterval`) and the end of the round (`setTimeout`). They all live in **one effect keyed on `isPlaying`**:

```js
useEffect(() => {
  if (!isPlaying) return;
  const spawner = setInterval(spawn, moleInterval);
  const clock   = setInterval(tick, 250);
  const end     = setTimeout(finish, duration);
  return () => { clearInterval(spawner); clearInterval(clock); clearTimeout(end); };
}, [isPlaying, duration, holes, moleInterval]);
```

When `finish` sets `status` to `'over'`, `isPlaying` flips and React runs the cleanup, so nothing can keep spawning moles after the game. Unmounting mid-round clears everything too, and under Strict Mode's mount → unmount → mount check, you get exactly one set of timers.

Common bugs this avoids:

- **Intervals started in the click handler** with their IDs kept in local variables. The IDs are lost on re-render, so the timers leak.
- **Stale closures:** an interval created once reads the `score` or `moles` from the render it was created in. The spawner only *writes* (`setMoles(newSet)`), and the countdown derives from `endsAt`, so neither needs fresh state.
- **Drift:** `setTimeLeft(t => t - 1000)` every second drifts, because timers fire late (and browsers throttle them to ≥ 1 s in background tabs). Computing `endsAt - Date.now()` is always correct. The round still ends on its own `setTimeout`, so the score isn't affected by display ticks.

`random` is read through a ref. A parent that passes `random={() => …}` inline creates a new function on every render, and listing it as an effect dependency would restart the whole round on every render.

## Hitting a mole

```js
function whack(index) {
  if (!isPlaying || !moles.has(index)) return;
  setMoles(prev => { const next = new Set(prev); next.delete(index); return next; });
  setScore(s => s + 1);
}
```

- The mole is removed immediately, so a double-click can't score twice. React re-renders between discrete events, so the second event sees the updated `moles`.
- Don't call `setScore` *inside* the `setMoles` updater. Updaters must be pure: Strict Mode calls them twice in development, which would add 2 points per hit.
- **Pointer down, not click.** A click fires on pointer *up*, which adds 100 ms or more of latency in a reaction game. The solution hits on `pointerdown` (primary button only) and still handles keyboard activation via `click` events with `detail === 0`. That combination avoids counting a mouse hit twice.
- `touch-action: manipulation` removes the double-tap-to-zoom delay on mobile.

## Accessibility

- Holes are real buttons named `Hole 3, mole` or `Hole 3, empty`. Before and after the round they're `aria-disabled`, so focus isn't thrown away when the game ends.
- **Number keys 1–9** map to the holes (exposed with `aria-keyshortcuts`). Tabbing to a moving target in under a second is impossible, so this is what makes the game playable by keyboard. The listener goes through a ref to the latest `whack`, so it's bound once per round and never stale.
- The final score is announced via `role="status"`. Don't announce every mole: a live region firing every 900 ms makes the screen reader unusable.
- **WCAG 2.2.1 (Timing Adjustable):** a timed game is an accepted exception, but offering a slower mode (a larger `moleInterval`) is a good inclusive touch.
- `prefers-reduced-motion` turns off the pop-up transition. Moles still appear, just without the animation.

## Edge cases

- **Start while playing:** the button is disabled during a round.
- **Play again** resets the score and time, and the effect starts a new round because `isPlaying` goes false → true.
- **Tab hidden:** the round still ends at the right wall-clock time. You could pause on `visibilitychange` instead: store the remaining ms and restart with that.
- If `holes` is smaller than the number of moles requested, `pickMoles` clamps the count.

## Scaling the game

- **Difficulty curve:** derive `moleInterval` and how long each mole stays up from the elapsed fraction of the round. Give each mole its own `{ hole, expiresAt }` and check expiry inside a single `requestAnimationFrame` loop, rather than one `setTimeout` per mole.
- **High scores:** `localStorage`, or a server for leaderboards. Validate scores server-side (rate of hits, round length), because client scores are trivially forged.
- **Performance:** with 9 holes, re-rendering everything is fine. With a large field, memoise a `Hole` component with primitive props so each tick re-renders only the holes that changed.

## Follow-ups

- *"Why did my moles keep appearing after the game ended?"* An interval was never cleared, usually because it was started outside an effect or its cleanup was missing.
- *"How would you test it without waiting 15 seconds?"* Inject `duration`, `moleInterval` and `random` (as the tests do), or use fake timers.
- *"Pause and resume?"* Add a `'paused'` status. On pause, store `endsAt - now`. On resume, set a new `endsAt`. The effect structure stays the same.
