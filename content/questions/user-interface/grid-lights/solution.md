## State design

The only essential state is the **activation order**: `order: number[]` of cell indices. Everything else is derived from it:

- a light is on ⇔ `order.includes(index)`
- all lights are on ⇔ `order.length === lightCount`
- the next light to switch off ⇔ `order.at(-1)`

A separate `isOn` boolean per cell would duplicate information that's already in `order`. You'd then have to keep the two in sync, and that sync is exactly where bugs appear. `deactivating` is a separate flag because it's a *mode*: "all on" and "currently switching off" aren't the same moment once the first light goes out.

`includes` is O(n) per cell, so O(n²) per render. That's irrelevant for 8 lights. For a big grid, derive a `Set` once with `useMemo`.

## Driving the reverse sequence

The tempting version is a single interval created when the last light turns on:

```js
const id = setInterval(() => {
  setOrder(order.slice(0, -1)); // ❌ `order` is captured once, so this removes the same light forever
}, delay);
```

That's the classic **stale closure**. You could fix it with a functional update, but then you also have to stop the interval when the array is empty, and you can't call `clearInterval` cleanly from inside the updater.

The solution uses **one timeout per step**, scheduled by an effect that depends on `order`:

```js
useEffect(() => {
  if (!deactivating) return;
  const t = setTimeout(() => {
    const next = order.slice(0, -1);
    setOrder(next);
    if (next.length === 0) setDeactivating(false);
  }, delay);
  return () => clearTimeout(t);
}, [deactivating, order, delay]);
```

Each step changes `order`, which re-runs the effect, which schedules the next step with the **current** order. The sequence ends itself when the array is empty, and the cleanup guarantees that no timer survives an unmount. It also behaves correctly under Strict Mode, where the extra mount/unmount simply cancels and reschedules the step.

## Accessibility

- Each light is a native `<button>` with **`aria-pressed`**, the APG toggle-button pattern, so screen readers say "Light at row 1, column 2, toggle button, pressed". The name describes *what* the control is, and `aria-pressed` describes its *state*. Don't put "on/off" in the label as well.
- Gaps (`0` cells) are an `aria-hidden` `<span>`. They hold their grid position but aren't in the accessibility tree or the tab order.
- During deactivation, and for lights that are already on, the buttons are `aria-disabled` rather than `disabled`, so focus isn't thrown to `<body>` when the sequence starts.
- A `role="status"` region announces "All lights on. Switching off…". Without it, a non-sighted user sees their clicks start doing nothing, with no explanation.
- The on state is shown with fill, border *and* glow, not hue alone. The colour transition is turned off under `prefers-reduced-motion`.

## Edge cases

- Clicking a lit light: a no-op (`order.includes`), so it can't be added twice and lengthen the sequence.
- A config with **zero** lights: `lightCount` is 0 and nothing can be clicked. A config with a single light: one click turns it on and it goes off after `delay`.
- Ragged configs (rows of different lengths): the solution assumes a rectangle. Validate, or pad shorter rows with `0`.
- Changing `delay` mid-sequence: the effect depends on `delay`, so the next step uses the new value.

## Productionising

- Generalise into a `useSequence(order, { delay, onDone })` hook if several components need "undo steps one at a time".
- For hundreds of cells, memoise a `Light` component with primitive props (`isOn`, `disabled`, `label`) and use event delegation, so each step re-renders one button.
- If precise timing matters (animations synced to audio), drive the steps from `requestAnimationFrame` with timestamps instead of chained `setTimeout`s.

## Follow-ups

- **Manual off:** clicking a lit light removes it from `order` (`order.filter(i => i !== index)`), which keeps the reverse sequence correct.
- **Pause and resume:** add a `paused` flag to the effect's guard. Because each step is a fresh timeout, resuming just reschedules.
- **Testing timing:** inject `delay` (as the tests do) and assert with `waitFor`, or use fake timers and `advanceTimersByTime`.
