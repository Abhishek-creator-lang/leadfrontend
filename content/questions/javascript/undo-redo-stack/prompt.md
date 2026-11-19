Implement an `UndoHistory` class that wraps a value and records its changes, so they can be undone and redone. It's the core of the undo button in editors, drawing apps and form builders (and of the classic "undoable counter" exercise).

```js
const counter = new UndoHistory(0);

counter.set(1);
counter.set(2);
counter.set(3);
counter.present; // 3

counter.undo();  // 2
counter.undo();  // 1
counter.redo();  // 2

counter.set(10); // a new change clears the redo stack
counter.canRedo; // false
counter.undo();  // 2
```

## API

| Member | Behaviour |
|---|---|
| `constructor(initial, { limit = Infinity }?)` | `limit` is the maximum number of **undo steps** kept. When exceeded, the oldest step is dropped. |
| `present` | Getter: the current value. |
| `set(value)` | Records `value` as the new present. The old present becomes undoable and the redo stack is cleared. If `Object.is(value, present)`, it does nothing. |
| `update(fn)` | Shorthand for `set(fn(present))`. |
| `undo()` | Moves one step back and returns the new present. With nothing to undo, returns the present unchanged. |
| `redo()` | Moves one step forward and returns the new present. With nothing to redo, returns the present unchanged. |
| `canUndo` / `canRedo` | Getters. |
| `reset(value)` | Sets the present and clears **both** stacks (for example after saving or loading a document). |

## Requirements

- All operations except trimming to `limit` should be O(1).
- Values are stored as-is (don't clone them). Callers are expected to treat them as immutable.

## Follow-up

- What's the memory trade-off between storing snapshots and storing commands (operations with inverses)?
- How would you **coalesce** changes, so typing a word creates one undo step instead of one per keystroke?
- How would you implement undo in a collaborative editor where other people's changes arrive concurrently?
