## Approach

The structure is the same as `Promise.all`: a counter, a results array written by index, and a `resolve` call when the counter reaches zero. The difference is that **both** outcomes count as "done", and neither one rejects the outer promise.

For each item at index `i`:

```js
Promise.resolve(item).then(
  (value) => settle(i, { status: 'fulfilled', value }),
  (reason) => settle(i, { status: 'rejected', reason }),
);
```

`settle` writes the outcome, decrements `remaining`, and resolves the outer promise when nothing is left.

The outer promise only rejects in one case: when the argument isn't iterable. `[...iterable]` throws inside the executor, and the constructor turns that into a rejection.

## Complexity

O(n) time and space. The total time is that of the slowest item.

## Edge cases

- **Empty input:** resolve `[]` immediately, otherwise nothing ever calls `resolve`.
- **Rejections with `undefined`:** the result is `{ status: 'rejected', reason: undefined }`. Don't use the truthiness of the reason to decide the status.
- **Thenables that call both callbacks:** `Promise.resolve` guarantees only the first call counts, so an item is never counted twice.
- **Same promise twice in the input:** each index gets its own handler, so both slots are filled.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Wrapping each item in `try/await` inside a sequential `for` loop | Correct results, but items are awaited one at a time |
| Using `.catch().then()` per item and counting inside `.then` only | Works, but easy to get wrong. Two-argument `.then` is clearer |
| Adding `value: undefined` to rejected outcomes | Shape differs from native: `'value' in outcome` becomes true for rejections |
| `results.push` | Wrong order |

## When to use it

`all` is right when the results are only useful together, such as loading a form's schema plus its data. `allSettled` is right when each item is independent:

- A dashboard where one failing widget should show an error tile and not blank the page.
- Batch uploads where you report "8 of 10 succeeded" and offer to retry the failures.
- Cleanup work (closing connections, flushing logs) where every step must be attempted.

A common pattern after `allSettled`:

```js
const outcomes = await Promise.allSettled(uploads);
const failed = outcomes.flatMap((o, i) => (o.status === 'rejected' ? [{ file: files[i], error: o.reason }] : []));
```

## Follow-ups

- **Progressive results:** `allSettled` only resolves at the end. For a progress UI, attach a callback to each promise directly (`p.then(onEach)`), or write an async generator that yields outcomes as they complete.
- **Timeouts:** an item that never settles keeps `allSettled` pending forever. Wrap each item with a timeout (see the `promise-timeout` question) so the overall operation has an upper bound.
- **Browser support:** `allSettled` arrived in ES2020. That is why polyfilling it was a real need, not just an interview exercise.
