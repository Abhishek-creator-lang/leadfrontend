Implement `mapAsyncLimit(items, limit, callback)`. Like an async `map`, it resolves to the results **in input order**, but at most `limit` calls of `callback` may be in flight at the same time. As soon as one call settles, the next unstarted item begins.

```js
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 6 uploads, at most 2 at a time
const ids = await mapAsyncLimit(files, 2, async (file) => {
  const res = await upload(file);
  return res.id;
});
```

Timeline for `limit = 2` and durations `[30, 10, 10, 10]`:

```
t=0   start #0 (30ms), start #1 (10ms)
t=10  #1 done -> start #2
t=20  #2 done -> start #3
t=30  #0 done, #3 done -> resolve [r0, r1, r2, r3]
```

## Requirements

- `callback(item, index)` may return a value or a promise, or throw synchronously.
- Items start in index order.
- Never more than `limit` calls are pending at once. If `limit` is greater than the number of items, all of them start immediately.
- If a call rejects, the returned promise rejects with that reason and **no further items are started** (calls already running are allowed to finish).
- An empty array resolves to `[]`.
- You may assume `limit` is a positive integer.

## Follow-up

- How does this differ from splitting the array into chunks of `limit` and running each chunk with `Promise.all`?
- How would you support `limit = Infinity`?
- How would you make this work for an async iterable of unknown length?
