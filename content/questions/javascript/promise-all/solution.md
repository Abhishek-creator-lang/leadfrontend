## Approach

Wrap everything in `new Promise((resolve, reject) => { ... })` and keep two pieces of state in the closure:

- `results`: an array where each fulfillment value is written **at its input index**.
- `remaining`: how many items have not fulfilled yet.

For each item at index `i`:

1. Normalize it with `Promise.resolve(item)`. Plain values, native promises and thenables then all look the same.
2. `.then(value => { results[i] = value; if (--remaining === 0) resolve(results); }, reject)`.

Rejections go straight to `reject`. A promise can only settle once, so the first rejection wins and later calls are no-ops. You don't need a "done" flag.

## Why `results[i]` and not `push`?

Items finish in **completion** order, but `Promise.all` promises **input** order. Capturing `i` per item (with `let` in the loop or the `forEach` index) and writing by index is the core of the question.

## Handling the iterable

`[...iterable]` converts any iterable (arrays, Sets, generators, strings) into an array. For a non-iterable it throws a `TypeError`. Because that happens **inside the executor**, the `Promise` constructor catches it and the returned promise rejects. That matches the native behaviour, where `Promise.all(5)` returns a rejected promise rather than throwing.

Don't use `Array.from` here. `Array.from(5)` returns `[]` instead of throwing, because it falls back to treating the argument as an array-like.

## Empty input

With zero items, no `.then` callback ever runs, so `resolve` would never be called. Check `if (items.length === 0) resolve([])` up front. The spec does the same thing in a different way: it starts the counter at 1 and decrements it after the loop.

## Complexity

O(n) time and space. The total wall-clock time is that of the slowest item, because all items run concurrently. `Promise.all` doesn't start anything, it only waits on work that has already started.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `results.push(value)` | Results come back in completion order |
| `if (results.length === n)` as the completion check | Writing `results[5]` first sets `length` to 6, so the check fires early |
| No empty-array check | Promise never settles |
| `item.then(...)` without `Promise.resolve` | Crashes on plain values |
| `await` inside a `for` loop | Runs sequentially, and an early rejection is reported late |
| Throwing synchronously for bad input | Diverges from native: callers using `.catch` miss it |

## Follow-ups

- **Cancellation:** pass an `AbortSignal` into each task. In the rejection handler, call `controller.abort()` so in-flight `fetch`es stop.
- **Concurrency limits:** if you have task *functions*, you can control when each one starts. Use a pool that keeps N in flight (see the `promise-pool` and `map-async-limit` questions).
- **`allSettled` vs `all`:** use `allSettled` when partial success is meaningful, for example a dashboard where one widget failing shouldn't blank the page.
- **Unhandled rejections:** after `all` rejects, the other promises can still reject later. Those rejections are handled, because `all` attached handlers to every input, so they don't trigger `unhandledrejection` warnings.
