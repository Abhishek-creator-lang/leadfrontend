Build a **sortable list**: users reorder items by dragging a handle with a mouse, a pen or a finger, **or** entirely with the keyboard.

The starter renders the list with a handle (⠿) on each row. Nothing moves yet.

## Requirements

**Pointer**

1. Pressing on a row's handle and moving the pointer drags that row. When the pointer passes the middle of a neighbouring row, the rows swap. Releasing drops the row.
2. Use **Pointer Events** with pointer capture, so mouse, touch and pen share one code path and the drag continues even if the pointer leaves the handle. Stop the page from scrolling while dragging on touch screens.
3. The dragged row is visibly lifted.

**Keyboard** (WCAG 2.5.7 requires a non-dragging alternative)

4. Each handle is a button named `Reorder <item>`, described by short instructions.
5. <kbd>Space</kbd> or <kbd>Enter</kbd> on a handle **picks up** the item (`aria-pressed="true"`). While it's held:
   - <kbd>↑</kbd>/<kbd>↓</kbd> move it one position, staying within the list bounds
   - <kbd>Space</kbd>/<kbd>Enter</kbd> **drops** it
   - <kbd>Escape</kbd> **cancels** and restores the original position
   - Focus stays on the moving item's handle.
6. Announce each step in a polite live region:
   - `Picked up Review PR #42. Position 2 of 5.`
   - `Review PR #42 moved to position 3 of 5.`
   - `Dropped Review PR #42 at position 3 of 5.`
   - `Reorder cancelled. Review PR #42 returned to position 2 of 5.`
7. Items need stable identity: use keys from ids, never indexes.

## Follow-up

- Add drag between multiple lists (see the kanban question).
- How would you auto-scroll a long list while dragging near its edges?
- What does the native HTML Drag and Drop API give you, and why do many libraries avoid it?
