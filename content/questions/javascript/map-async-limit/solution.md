## Approach: a shared cursor and `limit` workers

The cleanest mental model is a small **worker pool**. Keep a shared `nextIndex` cursor. Start `min(limit, n)` workers. Each worker:

1. Takes the next index (`nextIndex++`). Because JavaScript is single-threaded, this read-and-increment can't race.
2. Runs `callback(items[i], i)` and stores the result at `results[i]`.
3. When the call settles, loops back to step 1 until the cursor passes the end.

The outer promise resolves when every item has completed (`completed === n`), not when the cursor reaches the end, because the last items may still be running at that point.

The solution uses a recursive `launchNext()` rather than `async` worker loops. It does the same thing and makes it easy to stop launching after a failure: a `failed` flag is checked before starting anything new.

## Why not chunk the array?

`for (chunk of chunks) await Promise.all(chunk.map(cb))` also limits concurrency, but each chunk waits for its **slowest** member. With durations `[100, 1, 1, 1]` and `limit = 2`, chunking takes about 101ms + 1ms, while the sliding window starts item 2 the moment item 1 finishes. A sliding window keeps all `limit` slots busy, and interviewers specifically look for it.

## Complexity

O(n) time and space for bookkeeping. Wall-clock time is roughly `sum(durations) / limit` in the balanced case, and never less than the longest single call.

## Edge cases

- **Empty input:** resolve immediately, otherwise no worker runs and nothing ever settles.
- **`limit > n`:** start only `n` workers.
- **Synchronous throws:** wrap the call in `try/catch` and treat it like a rejection.
- **Fail fast:** once `failed` is set, `launchNext` returns without starting anything. Calls already in flight finish, but their results are ignored because the promise is already rejected.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Resolving when `nextIndex === n` | Resolves while the last calls are still running, with holes in `results` |
| `results.push(...)` | Results in completion order |
| Starting a new item on rejection | Keeps doing work, such as uploads, after the caller has already received an error |
| A `while (running < limit)` busy loop with `await` | Easy to get wrong; either it runs serially or it deadlocks |

## Real-world connection

This is the core of `p-limit`/`p-map` and of every "upload N files, 3 at a time" feature. Browsers already queue requests above six per origin on HTTP/1.1, but limiting on the client also protects the **server** and keeps the UI responsive, because results start arriving early. Build tools use the same pattern: webpack, Jest's worker pool and `npm install` all cap parallel work so they don't exhaust file descriptors or CPU.

## Follow-ups

- **Retry per item:** wrap `callback` with a retry and backoff helper. The limiter doesn't need to change.
- **Cancellation:** create an `AbortController`, pass `signal` to every call and abort on the first failure.
- **Async iterables:** replace the index cursor with `iterator.next()`. Each worker `await`s the iterator, so the source is read lazily and memory stays bounded.
- **Priorities or dynamic adds:** that's a task queue, not a map. See *Promise Pool* and *Async Queue with Priority*.
