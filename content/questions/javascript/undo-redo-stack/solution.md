## Approach: past, present, future

The standard model (it's the one in the Redux docs' undo recipe) uses three pieces:

```text
past:    [v0, v1, v2]   <- stack, top is the most recent previous value
present: v3
future:  [v5, v4]       <- stack, top is the next value to redo
```

- **`set(v)`:** push `present` onto `past`, make `v` the present, and **clear `future`**. Once you make a new change after undoing, the old "redo" branch no longer follows from the present, so it's discarded.
- **`undo()`:** push `present` onto `future`, pop `past` into `present`.
- **`redo()`:** push `present` onto `past`, pop `future` into `present`.

Both stacks are arrays used with `push`/`pop` on the end, so every operation is O(1).

### No-op detection

If `Object.is(value, present)`, return early. Without this, re-setting the same value (a common result of controlled inputs re-emitting, or of `update(x => x)`) would add an undo step that "does nothing", and it would also wipe the redo stack. Users experience that as "undo is broken: I pressed it and nothing happened".

### Bounding the history

With `limit` set, after pushing onto `past`, drop the oldest entry while `past.length > limit`. `shift()` is O(n) on arrays, but it only runs when the limit is hit, and n is the limit. A ring buffer makes it O(1) if it matters. Applying the limit to `past` only is enough: `future` can never be longer than the steps you've undone from `past`.

### `undo`/`redo` at the boundaries

Return the present unchanged rather than throwing. UI code calls these from keyboard shortcuts without checking first, and the `canUndo`/`canRedo` getters exist to disable the buttons.

## Complexity

O(1) for every operation (amortised O(1) for `set` with a limit, using a ring buffer). Memory is O(limit) **references**. Since values are not cloned, consecutive immutable snapshots share structure, which is what makes snapshot-based undo affordable.

## Snapshots vs commands

| | Snapshots (this solution) | Commands |
|---|---|---|
| Store | The whole value at each step | The operation and how to invert it (`insert "a" at 5` / `delete 1 at 5`) |
| Memory | Cheap with immutable structural sharing; expensive if you deep-clone large documents | Proportional to the size of each change |
| Complexity | Trivial to implement | Every operation needs a correct inverse |
| Used by | Redux undo, Zustand `temporal`, Excalidraw | ProseMirror, VS Code, Photoshop's history panel |

Large documents and collaborative editors use commands (or transactions), because a snapshot per keystroke of a large document is wasteful when values aren't structurally shared.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Not clearing `future` on `set` | Redo jumps to a state from an abandoned branch |
| Recording no-op sets | Undo appears to do nothing and redo is lost |
| A single array with an index, but forgetting to truncate on `set` | Same stale-redo bug |
| Mutating the stored value in place | Every history entry points at the same, mutated object |
| Throwing when nothing can be undone | Keyboard shortcuts crash |

## Real-world connection

- **Redux undo** (`redux-undo`) wraps a reducer with exactly this `{ past, present, future }` shape, with filters for which actions are undoable and `groupBy` for coalescing.
- **Figma, Excalidraw, tldraw** keep undo stacks of changes; tldraw groups changes into "marks" so a drag is one undo step.
- **Browsers:** `contenteditable` and `<input>` have native undo stacks; if you set `.value` programmatically, the native stack is lost. That's why rich editors manage their own history.

## Follow-ups

- **Coalescing:** a `set(value, { merge: true })` replaces `present` without pushing when the previous change was "the same kind" and recent (for example, typing within 500ms). Or debounce commits.
- **Checkpoints:** `reset` after save, or mark a "saved" position to show an unsaved-changes indicator by comparing positions.
- **Collaboration:** undo must only revert **your own** operations, transformed against others' changes (OT) or expressed in a CRDT; Yjs ships an `UndoManager` that tracks local origins.
