## State: normalised, behind a reducer

```js
{
  columns:   [{ id: 'todo', title: 'To do', cardIds: ['c1', 'c2'] }, …], // order lives here only
  cardsById: { c1: { id: 'c1', title: 'Write tests' }, … },            // data lives here only
}
```

Why normalise?

- **A move is cheap and safe:** it splices an id out of one `cardIds` array and into another. Card objects aren't copied, so there's no risk of a duplicated or stale card existing in two columns.
- **Edits touch one place:** renaming a card updates `cardsById[id]` and every view of it updates.
- **It mirrors the server:** most APIs return cards with a `columnId` and a `position`. Normalised client state maps 1:1 and merges nicely into a server cache.

All transitions (`add`, `delete`, `move`, `restore`) live in a **pure reducer** in its own module. The component calls the same reducer *directly* to preview a move's result (`boardReducer(board, action)`), so it can announce the new position and skip no-op moves without duplicating logic. `move` clamps the index to the target column's length, so moving the third card of a long column into a one-card column puts it at the end.

## Two input paths, one action

| Input | How the target is chosen | Action |
|---|---|---|
| Pointer drag | column = the one whose rect contains `clientX`; index = number of other cards whose midpoint is above `clientY` | `move` |
| Keyboard | ↑/↓ = index ± 1, ←/→ = column ± 1 (same index, clamped) | `move` |
| Escape | the snapshot taken at pick-up | `restore` |

### Pointer details

- `setPointerCapture` on the handle routes all moves and the release to it, even when the pointer leaves the card or crosses into another column.
- `touch-action: none` on the handle only, so the board can still be scrolled by touch elsewhere.
- The column under the pointer gets a dashed outline (`column--over`). Cards reorder live as the pointer passes their midpoints.
- `pointercancel` ends the drag cleanly.
- Measuring rects on every move is fine for dozens of cards. For big boards, cache the rects at drag start and re-measure only after a move, or throttle to animation frames.

### Keyboard details (WCAG 2.5.7)

- Each card has a **handle button** `Move <title>` with `aria-pressed` reflecting the "held" state and `aria-describedby` instructions.
- Moving a card to another column **re-parents its DOM node**, which always drops focus. An effect keyed on `board` re-focuses the moved card's handle, using a `Map` of refs by card id. The blur handler only treats a blur as "drop" when focus actually moved somewhere (`relatedTarget`).
- Escape restores the full board snapshot. That's simpler and more robust than reversing a sequence of moves.
- Announcements in a `role="status"` region give the column *and* the position: "Write tests moved to In progress, position 1 of 3."

## Other accessibility

- Each column is a `<section>` labelled by its heading, so it's exposed as a **region** and screen-reader users can jump between columns. The count is visible next to the title.
- Add forms have labels ("New card in Done") and a button named "Add to Done", so the three identical-looking forms are distinguishable.
- Delete buttons are named per card. Consider an Undo snackbar rather than a confirmation dialog.

## Edge cases

- Moving past the first or last column, or past the top or bottom of a column: the reducer returns the same state (`next === board`), so nothing is announced.
- Moving into an **empty** column: index 0. Empty lists keep a `min-height` so they remain drop targets for pointers.
- Deleting the held card: `held` points at a missing id. Clear `held` on delete in production.
- Blank titles: the reducer trims them and ignores them, which also guards against calls from places other than the form.

## Productionising

- **Ordering on the server:** storing integer positions means a move rewrites many rows. Use **fractional indexing** (a position between the neighbours' keys, e.g. LexoRank strings) so a move updates one card: `PATCH /cards/:id { columnId, position }`.
- **Optimistic updates:** dispatch the move immediately and send the request. On failure, restore the previous state (the snapshot again) and show an error.
- **Concurrency:** another user moves the same card. Server-sent events or a WebSocket broadcast `card.moved`. Merge into the normalised state. If it conflicts with a local in-flight move, last write wins and the UI reconciles to the server's order. Showing presence ("Alex is moving this card") avoids surprises.
- **Large columns:** virtualise each column's list. Keep the dragged card rendered in a portal overlay so it isn't unmounted when it scrolls out of the window, and auto-scroll near the edges while dragging.
- **Performance:** memoise a `Card` component keyed by id with primitive props, so a move re-renders two columns' lists, not every card's contents.
- **Animation:** FLIP transitions on reorder, turned off under `prefers-reduced-motion`.

## Follow-ups

- *"Why not keep `cards: [{ id, title, columnId, order }]` and filter per column?"* That's workable, but every render filters and sorts the whole list, and a move must renumber `order` fields. The normalised shape makes the order explicit.
- *"How do you test it?"* The reducer as pure unit tests (move across columns, clamping, delete), the keyboard path with Testing Library (as here), and pointer drags in a real browser.
