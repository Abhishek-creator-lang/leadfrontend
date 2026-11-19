Implement `createPriorityQueue(concurrency)`. It returns an async task queue in which at most `concurrency` tasks run at once. When a slot frees up, the queue starts the waiting task with the **highest priority**. Tasks with equal priority start in the order they were added.

A typical use is an image loader: thumbnails in the viewport should load before thumbnails far down the page, even if they were requested later.

```js
const queue = createPriorityQueue(1);

queue.add(() => load('a.jpg'));        // starts immediately (slot free)
queue.add(() => load('b.jpg'), 0);
queue.add(() => load('c.jpg'), 10);    // jumps ahead of b
queue.add(() => load('d.jpg'), 10);    // same priority as c, so after c

// start order: a, c, d, b
```

## API

| Member | Description |
|---|---|
| `add(task, priority = 0)` | `task` returns a value or a promise. Returns a promise that settles with the task's result or error. A larger number means higher priority. |
| `size` | Getter: number of tasks waiting to start. |
| `running` | Getter: number of tasks currently executing. |

## Requirements

- If a slot is free, `add` starts the task synchronously.
- Priorities only affect **waiting** tasks; a running task is never pre-empted.
- A failing task (rejection or synchronous throw) rejects only its own promise and frees its slot.
- Aim for O(log n) per `add` and per dequeue.

## Follow-up

- A steady stream of high-priority work can **starve** low-priority tasks forever. How would you prevent that?
- How would you let callers change a waiting task's priority, for example when an image scrolls into view?
- How does the browser's `scheduler.postTask()` relate to this?
