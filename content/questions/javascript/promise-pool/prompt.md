Implement `createPool(concurrency)`. It returns a **task pool** that runs async tasks with at most `concurrency` of them in flight. Unlike a one-off `mapAsyncLimit`, tasks can be added at any time, for example as the user drops files onto an upload area.

```js
const pool = createPool(2);

const a = pool.add(() => fetch('/api/a').then((r) => r.json()));
const b = pool.add(() => fetch('/api/b').then((r) => r.json()));
const c = pool.add(() => fetch('/api/c').then((r) => r.json())); // waits for a free slot

pool.running; // 2
pool.pending; // 1

await pool.onIdle(); // resolves once a, b and c have all settled
```

## API

| Member | Description |
|---|---|
| `add(task)` | `task` is a function that returns a value or a promise. Returns a promise that settles with the task's own result or error. |
| `running` | Getter: number of tasks currently executing. |
| `pending` | Getter: number of tasks waiting for a slot. |
| `onIdle()` | Returns a promise that resolves when nothing is running and nothing is queued. Resolves immediately if the pool is already idle. |

## Requirements

- Tasks start in the order they were added (FIFO).
- If a slot is free, `add` starts the task **synchronously**.
- A failing task (rejection or synchronous throw) rejects only its own promise. The pool keeps processing the queue.
- Calling `add` must not start the task if all slots are busy. Pass a function, not a promise, because a promise has already started.

## Follow-up

- How would you add `pause()` / `resume()`?
- How would you let callers cancel a task that is still queued?
- How would you change `concurrency` at runtime?
