Implement a `LinkedList` class. Values live in nodes that point to each other rather than in a contiguous array, which makes inserting or removing at the ends cheap. A playlist where tracks are queued at either end and dropped from the middle is a good mental model.

```js
const playlist = new LinkedList();
playlist.push('Intro');        // 1
playlist.push('Outro');        // 2
playlist.insertAt(1, 'Verse'); // true
playlist.toArray();            // ['Intro', 'Verse', 'Outro']
playlist.unshift('Count-in');  // 4
playlist.removeAt(2);          // 'Verse'
playlist.reverse();
playlist.toArray();            // ['Outro', 'Intro', 'Count-in']
```

## API

| Method | Returns | Description |
|---|---|---|
| `push(value)` | `number` | Appends to the end; returns the new length. |
| `unshift(value)` | `number` | Prepends to the start; returns the new length. |
| `pop()` | value or `undefined` | Removes and returns the last value. |
| `shift()` | value or `undefined` | Removes and returns the first value. |
| `get(index)` | value or `undefined` | The value at `index`, or `undefined` if out of range. |
| `insertAt(index, value)` | `boolean` | Inserts so that `value` ends up at `index` (`0 ≤ index ≤ length`). Returns `false` for an out-of-range index. |
| `removeAt(index)` | value or `undefined` | Removes and returns the value at `index`, or `undefined` if out of range. |
| `length()` | `number` | Number of values. |
| `toArray()` | `Array` | The values from first to last. |
| `reverse()` | `this` | Reverses the list in place by relinking nodes. |

## Constraints

- `push`, `unshift`, `shift`, `pop` and `length` must be O(1).
- Don't store the values in an array internally. The point is to manage the node links yourself.

## Follow-up

- How do you detect a cycle in a singly linked list using O(1) extra memory?
- Where do linked lists beat arrays in JavaScript, and where do they lose?
