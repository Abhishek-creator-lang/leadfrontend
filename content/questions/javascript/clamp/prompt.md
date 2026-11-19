Implement `clamp(number, lower, upper)`. It returns `number` if it lies within the inclusive range `[lower, upper]`. Otherwise it returns the nearest bound.

Clamping is everywhere in UI code: keeping a slider value in range, limiting a zoom level, or keeping a dragged element inside its container.

```js
clamp(3, 0, 5); // 3
clamp(-10, 0, 5); // 0
clamp(10, 0, 5); // 5
clamp(5, 0, 5); // 5  (bounds are inclusive)
clamp(-0.5, -1, 1); // -0.5
```

## Requirements

- All three arguments are numbers. You can assume `lower <= upper`.
- Bounds are **inclusive**.
- If `number` is `NaN`, return `NaN`.
- `Infinity` and `-Infinity` are valid inputs and bounds (`clamp(Infinity, 0, 5)` is `5`, `clamp(7, 0, Infinity)` is `7`).

## Follow-up

- What should happen if `lower > upper`? Pick a behaviour and justify it.
- How does this compare with the CSS `clamp(MIN, VAL, MAX)` function? Note the different argument order.
