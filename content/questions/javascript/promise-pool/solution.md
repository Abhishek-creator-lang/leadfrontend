## Approach

The pool owns three pieces of state:

- `queue`: entries of `{ task, resolve, reject }` that are waiting for a slot.
- `running`: the number of tasks currently executing.
- `idleWaiters`: resolve functions from `onIdle()` calls that are waiting for the pool to drain.

`add(task)` creates the promise it returns **up front** and stores its `resolve`/`reject` in the queue entry. This is the key trick: the caller's promise is connected to the task long before the task starts. Then `add` calls `drain()`.

`drain()` starts queued tasks while `running < concurrency`. For each one it:

1. Increments `running`.
2. Calls the task inside `try/catch`, so a synchronous throw becomes a rejection.
3. On settlement, decrements `running`, calls `drain()` again to fill the slot, and *then* forwards the result to the entry's `resolve`/`reject`. Releasing first means a caller that awaits `add(...)` and then reads `pool.running` sees an up-to-date count.
4. If `running === 0 && queue.length === 0`, resolves every waiting `onIdle` promise.

## Why tasks are functions

A promise represents work that has **already started**. If `add` took a promise, the pool couldn't delay it. Thunks (`() => fetch(url)`) let the pool decide when the work starts. That is the same reason `p-limit` and `async.queue` take functions.

## Complexity

`add` is O(1) amortised. `queue.shift()` is O(n) on a plain array. For very large queues, use a linked list or a head index so dequeueing is O(1). Memory is O(number of queued tasks).

## Edge cases

- **Errors don't stall the pool:** the slot is released in both branches. Forgetting the rejection path is the classic bug, because after `concurrency` failures the pool deadlocks.
- **`onIdle` on an idle pool:** resolve immediately, or callers hang forever.
- **Tasks that add more tasks:** they go to the back of the queue. `onIdle` correctly waits for them because idleness is only checked when both counters are zero.
- **Re-entrancy:** a task that settles synchronously (for example `() => 42`) still settles through a microtask because of `Promise.resolve`, so `drain` is never re-entered while it's iterating.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Releasing the slot only in `.then` | A few failures permanently lock the pool |
| Accepting promises instead of functions | All work starts immediately; the limit does nothing |
| Rejecting the pool when one task fails | One bad upload cancels everyone else's uploads |
| Implementing `onIdle` by polling with `setInterval` | Wasteful and racy |

## Real-world connection

- Upload widgets (Dropbox, Google Drive) process a queue of files a few at a time while the user keeps adding more.
- Node's `undici` and `http.Agent` (`maxSockets`) are connection pools with exactly this shape: requests wait in a queue for a free socket.
- Service workers that pre-cache assets throttle themselves this way so they don't fight the page for bandwidth.

## Follow-ups

- **Pause/resume:** a `paused` flag checked in `drain`; `resume()` sets it to false and calls `drain`.
- **Cancel a queued task:** return a handle with `cancel()` that removes the entry and rejects with an `AbortError`.
- **Resize:** update `concurrency` and call `drain()`. Shrinking simply stops starting new tasks until `running` drops below the new limit.
- **Priorities:** replace the FIFO array with a priority queue. See *Async Queue with Priority*.
- **Timeouts:** race each task against a timer and release the slot when the timer wins. Note that the underlying work keeps running unless it accepts an `AbortSignal`.
