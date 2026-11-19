## Approach

`any` is the mirror image of `all`. Swap the roles of fulfillment and rejection:

| | `Promise.all` | `Promise.any` |
|---|---|---|
| Settles early on | first **rejection** | first **fulfillment** |
| Collects (by index) | fulfillment values | rejection reasons |
| When everything is collected | fulfill with the values | reject with `AggregateError(reasons)` |
| Empty input | fulfills with `[]` | rejects with an empty `AggregateError` |

So the implementation is:

```js
items.forEach((item, i) => {
  Promise.resolve(item).then(resolve, (reason) => {
    errors[i] = reason;
    if (--remaining === 0) {
      reject(new AggregateError(errors, 'All promises were rejected'));
    }
  });
});
```

Passing `resolve` directly as the fulfillment handler is enough. The first call wins and later calls are no-ops.

## Why index-ordered errors?

The spec stores each reason at the item's index, so `errors` lines up with the input no matter which rejection arrived first. With `push`, you can't tell which mirror or endpoint produced which error.

## Complexity

O(n) time and space. Wall-clock time is that of the fastest success, or the slowest failure if everything fails.

## Edge cases

- **Empty iterable:** it must reject, because "at least one fulfilled" is impossible. Check `items.length === 0` up front and reject synchronously inside the executor.
- **Mixed timing:** a rejection that arrives **after** a fulfillment is ignored. The outer promise is already settled.
- **Non-iterable:** `[...iterable]` throws inside the executor, so the result rejects with a `TypeError`. It is *not* an `AggregateError`.
- **`AggregateError` support:** it is ES2021, like `any` itself. In a genuinely old environment, a fallback is an `Error` with an `errors` property attached.

## Common mistakes

- **Rejecting on the first rejection** (copy-pasted from `all`).
- **Resolving with an array**, or waiting for all items, when only the first success matters.
- **Forgetting the empty case.** The promise then never settles.
- **Rejecting with a plain array** of reasons instead of an `AggregateError`. Callers checking `instanceof AggregateError` or `e.errors` break.

## `any` vs `race`

- `race` settles with the first item to settle **in either direction**. A fast failure wins the race. Use it for timeouts: `race([fetchData(), timeout(5000)])`.
- `any` waits for the first **success** and only fails if everyone fails. Use it for redundancy: fetch the same resource from several CDNs/mirrors, or try several cache layers, and take whichever answers first.

## Follow-ups

- **Cancelling the losers:** give each request its own `AbortController` (or a shared one). When `any` fulfills, abort the rest so you aren't wasting bandwidth or server capacity.
- **Hedged requests:** start the second request only if the first hasn't answered within, say, the p95 latency. This is a lead-level latency technique that combines `any` with delays.
- **Error reporting:** log `e.errors` individually. Logging only `e.message` ("All promises were rejected") hides the real causes.
