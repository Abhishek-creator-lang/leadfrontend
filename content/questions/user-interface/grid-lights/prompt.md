Build a **grid of lights** driven by a configuration matrix. A `1` is a light and a `0` is an empty gap. The default layout is a 3 × 3 square without its centre (8 lights).

```js
const CONFIG = [
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 1],
];
```

## API

```js
export function GridLights({ config = CONFIG, delay = 300 })
```

## Requirements

1. All lights start **off**. Clicking an off light turns it **on**. Clicking a light that is already on does nothing.
2. The component remembers the **order** in which lights were switched on.
3. When the **last** light turns on, the grid starts **deactivating**: every `delay` ms, the most recently activated light turns off, in **reverse** activation order, until all are off.
4. While deactivating, clicks are ignored. Once everything is off, the grid is interactive again.
5. The layout must follow `config` for any shape (gaps take up space but render nothing interactive).
6. Accessibility:
   - Each light is a toggle `<button>` with `aria-pressed`, named by position: `Light at row 1, column 2`.
   - During deactivation, lights are marked unavailable (`aria-disabled`) but stay focusable.
   - Announce `All lights on. Switching off…` when deactivation starts.
7. Clean up any pending timer if the component unmounts mid-sequence.

## Follow-up

- Let users switch a light off manually, removing it from the order.
- What breaks if you implement step 3 with a single `setInterval` that captures `order`?
- Make the deactivation pausable.
