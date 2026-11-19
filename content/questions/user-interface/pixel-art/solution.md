## State design

| State | Where | Why |
|---|---|---|
| `cells`: flat array of 256 palette indices or `null` | `useState` | Flat is cheaper to copy than a 2D array, and `row * SIZE + col` is all the indexing you need |
| `colorIndex`, `tool` | `useState` | Drive the UI (checked radios) |
| `active` cell index | `useState` | Roving tabindex: which cell has `tabIndex=0` |
| `painting` (mouse button held) | **`useRef`** | Never rendered. Storing it in state would cost a render per stroke start/end for nothing |

Cells store an **index into the palette**, not a hex string. It's smaller, it lets you recolour the palette later, and it gives the accessible name ("Red") for free.

## Painting with the mouse

1. `mousedown` on a cell → `painting = true`, apply the tool to that cell. `preventDefault()` stops text selection and the browser's native drag ghost.
2. `mouseover` on another cell while `painting` → apply.
3. `mouseup` **on `window`** → `painting = false`. If you listen on the grid instead, releasing the button outside the canvas leaves the editor stuck in "painting" mode, which is the classic bug in this question. `blur` on the window also resets it (alt-tab mid-stroke).

The window listener is added in a `useEffect` and removed in its cleanup.

**Event delegation.** Instead of 256 × 3 handlers, the grid has one `onMouseDown`, one `onMouseOver` (it bubbles; `mouseenter` doesn't) and one `onKeyDown`, and reads `data-index` from `event.target`.

## Performance: why dragging can feel sluggish

Each painted cell creates a new `cells` array, which re-renders `App`. Without care, every stroke step re-renders all *N²* cells: 4,096 components on a 64 × 64 canvas, many times per second.

1. **`React.memo(Cell)`** with primitive props only (`index`, `colorIndex`, `tabbable`). Because handlers are delegated, no new callback props break memoization. Only the changed cell re-renders.
2. **Bail out of no-op updates.** Returning `prev` from the updater when the cell already has that value means hovering over painted cells doesn't render at all.
3. Beyond ~100 × 100, stop using DOM nodes: draw to a **`<canvas>`** (one element, `fillRect` per pixel) and keep the pixel data in a `Uint8Array` in a ref. For accessibility you'd keep the keyboard model and announce the focused pixel via a live region, since a canvas has no internal semantics.
4. Fast mouse movement skips cells (`mouseover` doesn't fire for every cell you cross). Production editors interpolate between the last and current pointer positions with **Bresenham's line algorithm**.

## Accessibility

- **Palette and tools are native radio groups** inside `<fieldset>`/`<legend>`. They give arrow-key selection, a single tab stop, "radio, 3 of 8, Red" announcements and form semantics with zero ARIA. The inputs are visually hidden (opacity 0, still focusable), with visible focus drawn on the swatch via `:focus-visible + .swatch`. Colour names are in visually hidden text, so the choice never relies on colour alone.
- **Canvas = WAI-ARIA grid:** `role="grid"` > `role="row"` > `role="gridcell"`, named by the page heading. Each cell's name includes its position *and* content (`Row 2, column 5: Blue`), so a screen-reader user can explore the drawing.
- **Roving tabindex:** exactly one cell has `tabIndex=0`. Arrow keys move it and focus the new cell, and <kbd>Home</kbd>/<kbd>End</kbd> go to the row ends. Tab leaves the grid instead of crawling through 256 stops.
- <kbd>Space</kbd>/<kbd>Enter</kbd> apply the tool. That's the keyboard alternative to dragging, which WCAG 2.5.7 (Dragging Movements) requires.
- The empty background is a checkerboard so "empty" and "White" are visually distinct.

## Edge cases

- Right-click shouldn't paint: check `e.button === 0`.
- Pressing on a cell, dragging out of the grid and back in while still holding the button keeps painting (the window `mouseup` hasn't fired), which matches user expectations.
- Clear replaces state with a fresh array. Consider a confirm or, better, undo.

## Follow-ups

- **Undo/redo:** keep `past` / `future` stacks of `cells` snapshots, pushing **one entry per stroke** (on mousedown), not per cell. Wrap it in `useReducer` with `PAINT`, `STROKE_START`, `UNDO`, `REDO`. Snapshots are cheap at 256 entries; for big canvases store diffs (`[index, before, after]`).
- **Export PNG:** draw `cells` onto an offscreen `<canvas>` scaled ×N, then `canvas.toBlob()` and download via an object URL (revoke it afterwards).
- **Touch/pen:** switch to Pointer Events. Pointer capture makes `pointerover` stop firing on other elements, so on `pointermove` use `document.elementFromPoint(x, y)` to find the cell, and set `touch-action: none` on the canvas so touch-drag doesn't scroll the page.
- **Persistence:** serialise `cells` to a compact string (one char per palette index) in `localStorage` or the URL.
