Build a tiny **pixel-art editor**: a 16 × 16 canvas of square cells, a colour palette and two tools.

The starter renders the static grid and palette swatches. Make it work.

## Requirements

1. **Palette:** eight colours (Black, White, Red, Orange, Yellow, Green, Blue, Purple). Exactly one is selected at a time, Black by default.
2. **Tools:** `Draw` (default) and `Erase`. Draw paints a cell with the selected colour. Erase returns it to empty.
3. **Mouse painting:** pressing the mouse button on a cell applies the tool. Moving over other cells **while the button is held** applies it to them too. Releasing the button anywhere (even outside the canvas) stops painting.
4. A **Clear** button empties the whole canvas.
5. **Keyboard drawing:** the canvas is one tab stop. Arrow keys move between cells, and <kbd>Space</kbd> or <kbd>Enter</kbd> applies the current tool to the focused cell.
6. Accessibility:
   - The palette and the tool switcher are proper single-choice groups with names.
   - The canvas uses `role="grid"`. Each cell is a `gridcell` whose name says where it is and what it holds, for example `Row 1, column 3: Red` or `Row 2, column 1: empty`.

## Follow-up

- Painting fast across a 64 × 64 canvas feels sluggish. Why, and how do you fix it?
- Add undo/redo.
- Export the drawing as a PNG.
- Make it work with touch and pen input.
