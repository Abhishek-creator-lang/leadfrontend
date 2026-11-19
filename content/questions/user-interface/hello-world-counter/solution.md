## State design

There is exactly one piece of state: the number. Everything else is **derived** during render:

- `atMin = count === 0` drives `disabled` on Decrement and Reset.
- No `useEffect` is needed. A common junior mistake is keeping `isDecrementDisabled` in its own state and syncing it in an effect, which adds an extra render and can drift out of sync.

## Updater functions

```js
setCount((c) => c + 1);
```

`setCount(count + 1)` reads `count` from the render's closure. If a handler calls it three times, all three calls compute `0 + 1`, because React batches the updates and `count` doesn't change until the next render. The updater form queues functions that each receive the latest value. It's a good habit whenever the next state depends on the previous one.

The lower bound is enforced **in the update itself** (`Math.max(0, c - 1)`), not just through the disabled button. The UI and the logic then can't disagree, for example when a keyboard shortcut or test triggers `decrement` directly.

## Accessibility

- `role="status"` is a polite live region, so assistive tech announces the new number after each click while focus stays on the button.
- The visible `+` and `−` symbols get an `aria-label` ("Increment"/"Decrement"). Otherwise a screen reader may read "plus" or nothing at all for `−` (U+2212).
- Real `<button type="button">` elements give focus, Enter and Space for free. `disabled` removes a button from the tab order. If you'd rather keep it focusable so users can discover it, use `aria-disabled="true"` and ignore clicks yourself.
- Buttons are at least 44×44 px (WCAG 2.5.8 target size) and show a `:focus-visible` outline.
- `font-variant-numeric: tabular-nums` stops the layout jiggling as digits change width.

## Edge cases

- Rapid double clicks: handled by updater functions.
- An upper bound: add `max` and clamp with `Math.min`.
- Very large numbers: `Number.MAX_SAFE_INTEGER` is far away, but format with `Intl.NumberFormat` if the number is meant for display.

## Productionizing

Extract a hook:

```js
function useCounter({ initial = 0, min = -Infinity, max = Infinity, step = 1 } = {}) {
  const [value, setValue] = useState(initial);
  const clamp = (n) => Math.min(max, Math.max(min, n));
  return {
    value,
    increment: () => setValue((v) => clamp(v + step)),
    decrement: () => setValue((v) => clamp(v - step)),
    reset: () => setValue(initial),
  };
}
```

For a design-system "number stepper", reach for the native `<input type="number">` or the WAI-ARIA spinbutton pattern (`role="spinbutton"`, `aria-valuenow/min/max`, arrow keys). That's the semantically correct widget when users can also type a value.

## Follow-ups

- **Persist the count:** lazily initialise from `localStorage` with `useState(() => …)` and write back in an effect.
- **Why not `useReducer`?** It's fine, and it pays off once there are several actions with shared rules. For one number with three actions, `useState` is clearer.
- **Testing:** query by role (`getByRole('button', { name: 'Increment' })`) and assert on the status text, never on class names.
