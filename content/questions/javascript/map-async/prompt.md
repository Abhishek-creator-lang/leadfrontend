Implement `mapAsync(items, callback)`. It works like `Array.prototype.map`, except that `callback` may return a promise. `mapAsync` returns a promise that resolves to the array of results **in the same order as `items`**, no matter which call finishes first.

All callbacks start straight away, so the calls run in parallel.

```js
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const doubled = await mapAsync([3, 1, 2], async (n) => {
  await sleep(n * 10); // 3 finishes last
  return n * 2;
});
// doubled -> [6, 2, 4]
```

## Requirements

- `callback(item, index)` is called once per item, synchronously, in index order.
- The callback can return a plain value, a promise, or throw. A synchronous throw counts as a rejection.
- If any call rejects, the returned promise rejects with that reason (the first rejection wins).
- An empty array resolves to `[]`.
- Do not use `Promise.all` (implement the bookkeeping yourself).

## Follow-up

- How would you cap the number of calls running at once? (See *Map Async with Limit*.)
- How would you return every outcome, success or failure, instead of failing fast?
- Should a rejection cancel the work that is still running? How would you do that with an `AbortSignal`?
