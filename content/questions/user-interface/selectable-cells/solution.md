## The model: anchor + pointer = rectangle

The whole interaction rests on one idea: **the selection during a drag is always `base ∪ rectangle(anchor, current)`**.

- `anchor` is the cell where the mouse went down.
- `current` is the cell under the pointer.
- `base` is what was selected before the drag: an empty set for a plain drag, the existing selection for a <kbd>Ctrl</kbd>/<kbd>⌘</kbd> drag.

Recomputing from scratch on every `mouseover`, instead of adding cells as you pass over them, makes **shrinking** work for free. Drag out to (4,4), come back to (2,3), and the selection is the smaller rectangle. Accumulating cells is the most common bug here: you end up with a "paint trail" instead of a rectangle.

`rectangle(a, b)` sorts the two rows and two columns, so dragging up-left works the same as down-right.

## State vs refs

| Data | Kind | Why |
|---|---|---|
| `selected: Set<index>` | state | Rendered (`aria-selected`, highlight, count) |
| `active` (focused cell) | state | Rendered (roving `tabIndex`) |
| `drag = { anchor, base, last }` | **ref** | Changes on every mouse move, never rendered on its own |
| keyboard `anchor` | **ref** | Only read in event handlers |

Every update creates a **new `Set`**. Mutating the existing one keeps the same reference, so React would skip the render. The count is derived (`selected.size`), not stored.

## Ending the drag

`mouseup` is listened for on **`window`**, in an effect with cleanup, so releasing outside the grid (or outside the browser, via `blur`) ends the drag. A grid-level `mouseup` leaves a "sticky" drag that keeps selecting as you hover later.

`mousedown` calls `preventDefault()` to stop the browser's text selection from fighting the custom one (plus `user-select: none` in CSS). It ignores non-primary buttons.

## Accessibility: the keyboard equivalent

WCAG 2.2 SC 2.5.7 requires a non-drag alternative. We follow the APG **grid** pattern with multi-selection, which mirrors spreadsheet conventions users already know:

| Key | Action |
|---|---|
| Arrows | Move focus (and the anchor) |
| <kbd>Space</kbd> | Toggle the focused cell, make it the anchor |
| <kbd>Shift</kbd>+Arrows | Select the rectangle anchor → focus |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>A</kbd> | Select all |
| <kbd>Escape</kbd> | Clear |

- `role="grid"` + `aria-multiselectable="true"`. `role="row"` wrappers so screen readers can report position. `aria-selected` on every cell (explicitly `false` too, so "not selected" is announced).
- **Roving tabindex:** one cell has `tabIndex=0`, so the grid is a single tab stop. Arrow handlers move focus with `.focus()`.
- Cells are named `Row 2, column 5`. In a real product, use the domain: "Tuesday 10:00".
- `aria-describedby` points at the instructions, and the count sits in a `role="status"` region so changes are announced politely.
- Selection is shown with colour **and** an inner white ring, so it doesn't rely on colour alone. Focus has its own, different outline.

## Performance

Each drag step changes `selected` and re-renders `App`. Two things keep that cheap:

1. **`memo(Cell)`** with primitive props only (`index`, `selected`, `tabbable`). All handlers are **delegated** to the grid (`mousedown`, `mouseover` and `keydown` bubble), so there are no per-cell callbacks to break memoization. Only cells whose `selected` flag flipped re-render.
2. Skip work when the pointer stays in the same cell (`drag.last`).

At **200 × 200 (40,000 cells)** the remaining costs are reconciling 40k elements per update and creating 40k-element sets:

- Represent the in-progress selection as **rectangles**, not a set of indices: `selection = { rects: [...], toggles: Set }`. "Is cell selected?" becomes a few range checks, and updating a drag is O(1).
- **Virtualize** rows and columns (render only the visible window, as spreadsheet apps do). That bounds the DOM to a few hundred cells.
- For pure visuals, draw the selection as **one absolutely positioned overlay** (a rectangle `div` spanning the range) instead of restyling every cell.
- Throttle `pointermove` with `requestAnimationFrame`.

## Touch and pen

Switch to **Pointer Events**. With pointer capture, `pointerover` stops firing on other elements, so in `pointermove` use `document.elementFromPoint(e.clientX, e.clientY)` to find the cell, and set `touch-action: none` on the grid so the finger drags a selection instead of scrolling. On touch, consider a long-press to start selecting, so normal scrolling still works.

## Follow-ups

- **Shift+click:** `rectangle(anchorRef.current, clicked)`, the mouse twin of Shift+arrow.
- **Ctrl+drag deselect:** if the anchor cell was already selected, subtract the rectangle instead of adding it (that's what spreadsheets and file managers do).
- **Auto-scroll** when dragging near the edge of a scrollable grid.
- **Controlled API:** `selected` / `onSelectedChange` props so a parent (for example a booking form) owns the value.
