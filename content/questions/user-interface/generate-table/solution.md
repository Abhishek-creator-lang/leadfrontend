## Form handling: uncontrolled + `FormData`

The table only changes **on submit**, so there's no reason to re-render on every keystroke. Uncontrolled inputs (`defaultValue`) read once via `new FormData(event.currentTarget)` are the simplest fit:

- No state per field, no `onChange` handlers.
- <kbd>Enter</kbd> submits because it's a real `<form>`.
- It matches React 19's form actions, which pass `FormData` to the action.

Controlled inputs would be the better choice if the table previewed live, or if one field's value constrained another as you type.

The only state is the **last valid submission** (`{ rows, columns, order }`) and the errors. Keeping the submitted config separate from the inputs is what makes "invalid input keeps the previous table" free.

## Generating values: a formula, not a filled array

```js
row:    r * columns + c + 1
column: c * rows + r + 1
snake:  c * rows + (c % 2 === 0 ? r : rows - 1 - r) + 1
```

Each cell's value is a pure function of its coordinates. The alternative is to allocate a 2D array and walk it with a counter (down the column, then flip direction). That works but is easier to get wrong (off-by-one when flipping), and it does two passes. The formula version is O(1) per cell, needs no extra memory, and the fill orders are easy to unit test (`cellValue` is exported).

Rendering is O(rows × columns), with at most 400 cells here.

## Accessibility

- A real `<table>` with a `<caption>`. Screen readers announce "table, 2 × 4 table, snake (columns) order, 2 rows, 4 columns", and table navigation keys work.
- There are no header cells because the data has no headers. Don't fake them with `<th>` or invent `scope`.
- Every input has a label. Errors use `aria-invalid` and `aria-describedby`. `noValidate` hands validation to our code.
- The table wrapper scrolls horizontally on narrow screens instead of overflowing the page. For a focusable scroll area, add `tabIndex={0}` and an `aria-label` to the wrapper so keyboard users can scroll it.
- Numbers are right-aligned with `tabular-nums` so the digits line up.

## Edge cases

- `"3.5"`, `"-1"`, `""` and `"abc"` are rejected by a strict whole-number check. `Number("")` is `0` and `parseInt("3abc")` is `3`, so neither is safe on its own.
- 1 × 1 gives a single cell, and 1 × N gives the same values in every order.
- Snake order with one row: each column has one cell, so the direction doesn't matter.

## Scaling

At 1,000 × 1,000 (a million cells) the DOM is the bottleneck, not the maths:

- **Virtualise** rows and columns (render only the visible window) using the same `cellValue(r, c)`. Formula-based generation makes this trivial, because there's nothing to precompute.
- Or render to `<canvas>` and provide an accessible alternative (a downloadable CSV, or a summary).
- Use keys based on row and column index. Indices are fine here because the cells are positional and never reorder.

## Follow-ups

- **Snake by rows:** swap the roles of `r` and `c`.
- **Spiral order:** the classic follow-up. Walk the boundary layers. A per-cell formula exists but a simulated walk is clearer to explain.
- **Highlight on hover:** derive the row and column from the hovered cell for a crosshair effect.
