Build a grid of **6 rows × 8 columns** where the user selects cells by dragging, like selecting a range in a spreadsheet or picking seats or time slots.

The starter renders the grid as plain boxes.

## Requirements

1. **Drag to select:** pressing the mouse on a cell and moving over other cells selects the **rectangle** between the cell where the drag started (the *anchor*) and the cell under the pointer. Moving back shrinks the rectangle. Releasing the button anywhere ends the drag.
2. Starting a new drag **replaces** the selection. Holding <kbd>Ctrl</kbd> (or <kbd>⌘</kbd>) while starting the drag **adds** the new rectangle to the existing selection.
3. Selected cells are visually highlighted. A status line under the grid reads `N cells selected` (`1 cell selected`, `0 cells selected`).
4. **Keyboard equivalent** (dragging must never be the only way, see WCAG 2.5.7):
   - The grid is one tab stop. Arrow keys move focus between cells.
   - <kbd>Space</kbd> toggles the focused cell and makes it the anchor.
   - <kbd>Shift</kbd> + arrow moves focus and selects the rectangle from the anchor to the focused cell.
   - <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>A</kbd> selects all cells. <kbd>Escape</kbd> clears the selection.
5. Accessibility: use the WAI-ARIA grid pattern with multi-selection (`aria-multiselectable`, `aria-selected` on each cell). Each cell is named by its position (`Row 2, column 5`), and the status line is announced.

## Follow-up

- How would this perform on a 200 × 200 grid? What would you change?
- Support touch devices.
- Shift+click to extend from the anchor, as in spreadsheets.
