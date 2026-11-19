## Architecture

```
SortableList
├─ items (state, ordered array of { id, label })
├─ held      keyboard "grab": { id, from, snapshot }   → Escape restores the snapshot
├─ dragId    pointer drag in progress
├─ <ul> rows: handle <button aria-pressed aria-describedby> + label
└─ live region (role=status) for announcements
move(list, from, to)   pure reorder helper
```

Both input modes go through the same pure `move()` and render the same live preview. The pointer path and the keyboard path differ only in how they *choose* the target index.

## Pointer dragging

- **Pointer Events** cover mouse, touch and pen in one code path. On `pointerdown` the handle calls `setPointerCapture(pointerId)`, so every subsequent `pointermove` and `pointerup` goes to the handle even when the pointer leaves it or the list. No `document` listeners to add or forget to remove.
- **Hit testing:** on each move, the target index is the number of *other* rows whose vertical midpoint is above the pointer. When it differs from the current index, the item is moved, so the list reorders live as you drag past each row's midpoint (the familiar "swap at the halfway point" feel).
- **`touch-action: none`** on the handle stops the browser from treating the gesture as a scroll. Without it, touch dragging just scrolls the page. Putting it only on the *handle* (not the whole row) keeps the list scrollable by touch.
- `pointercancel` (for example, the OS takes over the gesture) ends the drag.
- **Cost:** `getBoundingClientRect()` per row per move forces layout. That's fine for dozens of rows. For long lists, cache the rects at drag start and only re-measure after a reorder, or compute positions from a known row height.

### Why not native HTML5 drag and drop?

`draggable` + `dragstart`/`dragover`/`drop` works for mouse but has no touch support on many mobile browsers, offers very little styling control over the drag image, needs `preventDefault` in `dragover`, and has no keyboard story at all. Libraries such as dnd-kit and Pragmatic DnD build on pointer events (or wrap the native API) for these reasons. Mention native DnD as the right choice for dragging *files or data between apps*.

## Keyboard alternative (WCAG 2.5.7 Dragging Movements)

Dragging must have a single-pointer or keyboard alternative. The model (the same idea as GitHub's and Atlassian's lists):

| Key on handle | Effect |
|---|---|
| <kbd>Space</kbd> / <kbd>Enter</kbd> | Pick up (`aria-pressed="true"`), store the original position and a snapshot |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Move one position, clamped at the ends |
| <kbd>Space</kbd> / <kbd>Enter</kbd> again | Drop and commit (`onReorder`) |
| <kbd>Escape</kbd> | Restore the snapshot, announce the cancellation |
| <kbd>Tab</kbd> away | Drop where it is |

- **Focus follows the item.** Reordering makes React *move DOM nodes*, and in some browsers moving the focused node blurs it. An effect after each `items` change re-focuses the moved item's handle (`focusAfterMove` ref plus a `Map` of handle refs by id). The blur handler drops the item only when focus really went somewhere else (`relatedTarget` is set), not when the node was merely moved.
- **Instructions** are a visually hidden paragraph referenced by `aria-describedby`, read once on focus rather than repeated in every name.
- **Announcements** (polite live region) say the item, the action and the position, "Review PR #42 moved to position 3 of 5", because the visual change is invisible to screen-reader users.
- An even simpler alternative some teams ship: "Move up" / "Move down" buttons or a "Move to position…" menu. These are fine and sometimes preferable on touch screens with screen readers.

## Keys and identity

Rows are keyed by `id`. With index keys, React would reuse the *DOM* of row 0 for whatever item is now first, so focus, input state and animations would stay with the position instead of following the item, which is exactly wrong for a sortable list.

## Edge cases

- Picking up one item and pressing keys on another handle: only the held item reacts.
- Releasing the pointer outside the window: pointer capture still delivers `pointerup`.
- A single-item list: arrows are no-ops.
- Escape after several moves restores the exact original order (snapshot), not just the original index of one item.

## Productionising

- **Persisting order:** send the moved id plus its new neighbours (or a **fractional index** / LexoRank string) instead of rewriting every row's position. Update optimistically and roll back on error.
- **Animation:** FLIP. Measure positions before and after a reorder and animate the `transform` delta. Respect `prefers-reduced-motion`.
- **Auto-scroll:** while dragging near the scroll container's edges, scroll it in a `requestAnimationFrame` loop at a speed proportional to the distance from the edge.
- **Virtualised lists:** the dragged item must stay mounted, so render it in an overlay/portal while dragging.
- **Multiple lists** (kanban): the same model plus a target container. Keyboard: ←/→ move between columns.

## Follow-ups

- *"Why pointer capture instead of `window` listeners?"* Capture gives automatic routing plus `lostpointercapture` cleanup, with no global listeners to leak.
- *"How do you test drag?"* Unit-test `move()`, drive the keyboard path with Testing Library (as here), and test the pointer path in a real browser (Playwright `mouse.down`/`move`/`up`), because jsdom has no layout.
