Implement a `Stack` class: a last-in, first-out (LIFO) collection. The most recently added item is always the first one to come back out. An editor's undo history works this way: the last edit you made is the first one undone.

```js
const history = new Stack();
history.push('type "a"'); // 1
history.push('type "b"'); // 2
history.peek();           // 'type "b"'
history.pop();            // 'type "b"'
history.length();         // 1
history.isEmpty();        // false
```

## API

| Method | Returns | Description |
|---|---|---|
| `push(item)` | `number` | Adds `item` to the top and returns the new length. |
| `pop()` | item or `undefined` | Removes and returns the top item, or `undefined` if the stack is empty. |
| `peek()` | item or `undefined` | Returns the top item without removing it. |
| `isEmpty()` | `boolean` | `true` when there are no items. |
| `length()` | `number` | The number of items. |

## Constraints

- Every method must run in O(1) time (amortised for `push`).
- Items can be any value, including `undefined`, `null` and objects.
- Separate instances must not share state.

## Follow-up

- How would you add a `min()` method that also runs in O(1)?
- How would you cap an undo history at the most recent 100 entries?
