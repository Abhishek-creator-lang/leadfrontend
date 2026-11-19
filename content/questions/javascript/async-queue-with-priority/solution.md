## Approach

Split the problem in two:

1. **Which task goes next?** A priority queue (binary heap) of waiting entries.
2. **When can it start?** The same slot-counting logic as a promise pool: `running < concurrency`.

### Ordering with a stable tiebreak

A binary heap is **not stable**: two entries with the same priority can come out in any order. To get FIFO within a priority, each entry also gets an increasing `seq` number. The comparison is:

```js
function higher(a, b) {
  return a.priority !== b.priority ? a.priority > b.priority : a.seq < b.seq;
}
```

So the heap orders by `(priority desc, seq asc)`, which is a total order. Every pop returns the oldest entry of the highest priority.

### Running tasks

`add` creates the caller's promise first and stores `resolve`/`reject` on the heap entry, then calls `drain()`. `drain` pops entries while slots are free. When a task settles, the queue releases the slot (in both the success and failure paths), calls `drain` again, and then forwards the outcome to the task's own promise.

## Complexity

| Operation | Cost |
|---|---|
| `add` | O(log n) heap push |
| Start next task | O(log n) heap pop |
| Space | O(n) waiting entries |

A sorted array with `splice` insertion is O(n) per add. That's fine for tens of tasks, but say so and explain why the heap scales better.

## Edge cases

- **Priority ties:** handled by `seq`. Without it, a test that adds `c` and `d` at the same priority can see `d` start first.
- **Errors:** release the slot in both paths, or the queue deadlocks after `concurrency` failures.
- **Negative or fractional priorities:** they just work with numeric comparison.
- **Free slot on `add`:** the task starts synchronously, before any later, higher-priority task is even known. That is expected; priorities only reorder *waiting* work.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Using `Array.prototype.sort` on every add | O(n log n) per add, and easy to forget the tiebreak |
| No sequence tiebreak in the heap | FIFO within a priority isn't guaranteed |
| Comparing with `a.priority - b.priority` the wrong way round | Lowest priority runs first |
| Pre-empting running tasks | Promises can't be paused; the spec says never pre-empt |

## Starvation

With strict priorities, low-priority tasks can wait forever while higher-priority work keeps arriving. Common fixes:

- **Aging:** raise a waiting task's effective priority based on how long it has waited (for example `priority + waitedMs / 1000`). This needs re-heapifying or lazy re-evaluation.
- **Weighted fair queuing:** allot slots proportionally, for example two high-priority starts for every low-priority one.
- **Reserved capacity:** keep one slot for low-priority work.

## Real-world connection

- **React's scheduler** keeps a min-heap of tasks keyed by expiration time (priority converted to a deadline) with an id tiebreak, which is this design. Expiration times also solve starvation: an old low-priority task eventually expires and runs.
- **`scheduler.postTask(cb, { priority: 'user-blocking' | 'user-visible' | 'background' })`** is the browser-native version for main-thread work, and `TaskController` lets you change a task's priority after posting it.
- `fetch(url, { priority: 'high' })` and `<img fetchpriority="high">` give the browser's network stack priority hints.

## Follow-ups

- **Reprioritise:** keep a handle per entry with its heap index, update the priority and sift up or down. Or mark the old entry cancelled and push a new one (lazy deletion).
- **Cancel a waiting task:** lazy deletion again: flag it and skip it when popped.
- **`onIdle()` / pause / resume:** same as a promise pool.
