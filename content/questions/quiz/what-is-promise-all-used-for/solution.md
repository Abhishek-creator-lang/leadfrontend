## TL;DR

**`Promise.all(iterable)`** runs nothing itself. It **waits for several already-started async operations in parallel** and returns one promise that **fulfils with an array of results in input order** once **all** of them fulfil. It **rejects as soon as any one rejects** (fail-fast), with that first reason. Use it when the operations are **independent** and you **need every result** to continue.

## Typical use

```js
async function loadDashboard(userId) {
  const [user, orders, notifications] = await Promise.all([
    fetchJson(`/api/users/${userId}`),
    fetchJson(`/api/users/${userId}/orders`),
    fetchJson(`/api/notifications`),
  ]);
  return { user, orders, notifications };
}
```

Total time ≈ the **slowest** request, instead of the **sum** of all three if you awaited them one by one:

```js
// Sequential: ~ t1 + t2 + t3
const user = await fetchJson(a);
const orders = await fetchJson(b);

// Parallel: ~ max(t1, t2, t3)
const [user2, orders2] = await Promise.all([fetchJson(a), fetchJson(b)]);
```

## Semantics worth knowing

- **Order is preserved:** results match input positions, not completion order.
- **Non-promises are allowed:** `Promise.all([1, fetchX()])` treats `1` as already fulfilled.
- **Empty input** fulfils immediately with `[]`.
- **Fail-fast:** the first rejection rejects the whole thing. The other operations **keep running**: promises can't be cancelled, so their results (and later rejections) are just ignored.
- Any iterable works, e.g. `Promise.all(ids.map(load))` or a `Set` of promises.

## Combining with cancellation

Because fail-fast leaves other requests running, pass a shared signal and abort the rest when one fails:

```js
async function loadAll(urls) {
  const controller = new AbortController();
  try {
    return await Promise.all(
      urls.map((u) => fetch(u, { signal: controller.signal }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} for ${u}`);
        return r.json();
      })),
    );
  } catch (err) {
    controller.abort(); // stop the stragglers
    throw err;
  }
}
```

## Limiting concurrency

`Promise.all(hugeList.map(upload))` starts **everything at once**, which can overwhelm the server, hit browser connection limits or rate limits. Process in a pool instead:

```js
async function mapWithLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
```

## When to use something else

| Need | Use |
|---|---|
| Every outcome, even if some fail (e.g. batch upload report) | `Promise.allSettled` |
| First success among redundant sources (mirrors, CDNs) | `Promise.any` |
| First to settle, e.g. a timeout race | `Promise.race` (or `AbortSignal.timeout`) |
| Each step depends on the previous result | Sequential `await` |

## Pitfalls

- **Creating promises sequentially by mistake:** `for (const id of ids) results.push(await load(id))` is serial. Build the array of promises first, then `await Promise.all`.
- **`forEach` with async callbacks** doesn't wait for anything. Use `map` + `Promise.all`.
- **Unhandled rejections from the losers:** they're handled by `Promise.all`'s internal subscription, so no warning. But side effects from those operations still happen.
- **Partial failure UX:** with fail-fast, one failing widget can blank the whole page. Consider `allSettled` for independent UI sections.

## In an interview, mention…

- Parallel waiting, ordered results, fail-fast rejection.
- That rejection doesn't cancel the others, and how `AbortController` fixes that.
- Concurrency limits for large lists, and when `allSettled`/`any`/`race` fit better.
