React's scheduler keeps pending tasks in a priority queue ordered by their expiration time and always runs the most urgent one next. Implement a `MinHeap` class that could power such a scheduler.

```js
const tasks = new MinHeap((a, b) => a.deadline - b.deadline);
tasks.push({ name: 'render list', deadline: 250 });
tasks.push({ name: 'handle click', deadline: 10 });
tasks.push({ name: 'prefetch', deadline: 5000 });

tasks.peek().name; // 'handle click'
tasks.pop().name;  // 'handle click'
tasks.pop().name;  // 'render list'
tasks.size();      // 1

const nums = new MinHeap(); // default comparator: numbers ascending
[5, 1, 4].forEach((n) => nums.push(n));
nums.pop(); // 1
```

## API

| Method | Returns | Description |
|---|---|---|
| `constructor(compare?)` | | `compare(a, b)` returns a negative number when `a` should come out first. Defaults to `(a, b) => a - b`. |
| `push(value)` | `number` | Adds `value`; returns the new size. |
| `pop()` | value or `undefined` | Removes and returns the smallest value (by `compare`), or `undefined` if empty. |
| `peek()` | value or `undefined` | Returns the smallest value without removing it. |
| `size()` | `number` | Number of values. |

## Constraints

- `push` and `pop` must be O(log n); `peek` and `size` O(1).
- Store the heap in a flat array, not with node objects.
- Values that compare equal may come out in any order.

## Follow-up

- How would you build a heap from an existing array in O(n)?
- How would you support changing the priority of a task already in the heap?
