## Approach

This is `Promise.all` combined with `map`, so the solution is the same bookkeeping `Promise.all` does internally:

1. Create a `results` array the same length as the input and a `remaining` counter.
2. Start every callback synchronously. Wrap each return value in `Promise.resolve(...)` so plain values and thenables are handled the same way as promises.
3. When call `i` fulfils, write to `results[i]` (not `push`, which would record completion order) and decrement `remaining`. When it hits zero, resolve.
4. The first rejection calls `reject`. Later settlements still run their handlers, but a promise can only settle once, so they have no effect.

Wrapping the callback in `try/catch` turns a synchronous `throw` into a rejection. Otherwise the error would escape the executor of the outer `new Promise`, which happens to reject too, but it would also skip starting the remaining callbacks. Being explicit makes the behaviour obvious.

## Complexity

O(n) time for bookkeeping and O(n) space for results. Wall-clock time is the duration of the **slowest** call, because they all run together.

## Edge cases

- **Empty input:** the counter starts at zero, so nothing would ever resolve. Handle it up front.
- **Holes and `undefined` results:** assigning by index keeps them in place.
- **Mixed sync and async callbacks:** `Promise.resolve` normalises them.
- **Callback throws synchronously:** becomes a rejection, and the earlier calls have already started.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `results.push(value)` in the `then` handler | Results come back in completion order, not input order |
| `await` inside a `for` loop | Calls run one after another, so it is a sequential map |
| Checking `results.length === items.length` | `results[5] = x` sets `length` to 6 even if 0–4 are still pending |
| No empty-array check | The promise never settles |

## Real-world connection

This is the pattern behind "fetch the details for every id on the page": `mapAsync(ids, fetchUser)`. In production, an unbounded fan-out of 500 requests will hit the browser's per-origin connection limit (six for HTTP/1.1) or a server rate limit, which is why the bounded version (`mapAsync` with a limit) appears so often as a follow-up. Node's `fs.promises` and the AWS SDKs have the same concern, which is why libraries such as `p-map` take a `concurrency` option.

## Follow-ups

- **All outcomes:** mirror `Promise.allSettled` and store `{ status, value | reason }` per index instead of rejecting.
- **Cancellation:** pass an `AbortSignal` to each callback and abort the controller on the first failure, so in-flight `fetch` calls stop.
- **Async iterables:** accept a stream of items with `for await`, which needs a concurrency limit to avoid reading the whole stream eagerly.
