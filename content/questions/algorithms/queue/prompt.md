Implement a `Queue` class: a first-in, first-out (FIFO) collection. Items leave in the same order they arrived, like a list of toast notifications waiting to be shown one at a time.

```js
const toasts = new Queue();
toasts.enqueue('Saved');        // 1
toasts.enqueue('Copied link');  // 2
toasts.front();                 // 'Saved'
toasts.dequeue();               // 'Saved'
toasts.back();                  // 'Copied link'
toasts.length();                // 1
```

## API

| Method | Returns | Description |
|---|---|---|
| `enqueue(item)` | `number` | Adds `item` to the back and returns the new length. |
| `dequeue()` | item or `undefined` | Removes and returns the front item, or `undefined` when empty. |
| `front()` | item or `undefined` | The front item, without removing it. |
| `back()` | item or `undefined` | The most recently added item, without removing it. |
| `isEmpty()` | `boolean` | `true` when there are no items. |
| `length()` | `number` | The number of items. |

## Constraints

- `enqueue` and `dequeue` must both be O(1). `Array.prototype.shift` is O(n), so don't rely on it.
- Items can be any value, including `undefined`.
- The queue may see hundreds of thousands of operations.

## Follow-up

- How would you build a queue from two stacks? What is its amortised cost?
- How would you implement a fixed-capacity ring buffer?
