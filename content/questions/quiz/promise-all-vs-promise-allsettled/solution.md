## TL;DR

**`Promise.all`** is **fail-fast**: it fulfils with an **array of values** when every input fulfils, and **rejects with the first rejection reason** the moment any input rejects. **`Promise.allSettled`** (ES2020) **never rejects**: it waits until **every** input has settled and fulfils with an array of **`{ status: 'fulfilled', value }` / `{ status: 'rejected', reason }`** objects. Use `all` when you need every result to proceed; use `allSettled` when the operations are independent and partial success is useful.

## Side by side

```js
const ok = (v, ms) => new Promise((r) => setTimeout(() => r(v), ms));
const fail = (msg, ms) => new Promise((_, j) => setTimeout(() => j(new Error(msg)), ms));

await Promise.all([ok('a', 100), fail('b', 50), ok('c', 200)]);
// rejects after ~50 ms with Error('b'); 'a' and 'c' still finish in the background

await Promise.allSettled([ok('a', 100), fail('b', 50), ok('c', 200)]);
// fulfils after ~200 ms:
// [
//   { status: 'fulfilled', value: 'a' },
//   { status: 'rejected',  reason: Error('b') },
//   { status: 'fulfilled', value: 'c' },
// ]
```

| | `Promise.all` | `Promise.allSettled` |
|---|---|---|
| Fulfils when | All inputs fulfil | All inputs settle |
| Rejects when | Any input rejects (first one) | Never |
| Result | `[value, value, …]` | `[{status, value \| reason}, …]` |
| Time to finish on failure | Fast (first failure) | Waits for the slowest |
| Typical use | Dependent data for one view | Independent operations, batch jobs, reporting |

## Using `allSettled` results

```js
const results = await Promise.allSettled(files.map(upload));

const succeeded = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
const failed = results
  .map((r, i) => ({ r, file: files[i] }))
  .filter(({ r }) => r.status === 'rejected');

toast(`${succeeded.length} uploaded, ${failed.length} failed`);
failed.forEach(({ file, r }) => logError(file.name, r.reason));
```

Good fits:

- Dashboards where each widget loads independently; one failing API shouldn't blank the page.
- Batch uploads, notifications or analytics flushes where you report per item.
- Cleanup: closing several connections and logging any errors without stopping halfway.
- Tests or tooling that must wait for everything before asserting.

## Choosing in practice

Ask: **"If one fails, is the overall result still useful?"**

- No (e.g. you need user, permissions and config to render a page) → `Promise.all`. Failing early lets you show an error sooner and abort the other requests via `AbortController`.
- Yes → `allSettled`, and decide the UX for partial success.

The family also includes:

- **`Promise.any`**: first **fulfilment** wins; rejects with an `AggregateError` only if all reject. Good for redundant sources.
- **`Promise.race`**: first **settlement** wins, success or failure. Classic for timeouts.

## Pitfalls

- **`allSettled` hides errors if you don't inspect them.** Nothing throws, so it's easy to silently ignore failures. Always handle the rejected entries.
- **`all` doesn't cancel the rest.** Abort them explicitly if they are expensive.
- **TypeScript:** narrow on `r.status === 'fulfilled'` to access `r.value` (`PromiseSettledResult<T>`).
- Both start nothing themselves. Parallelism comes from creating the promises before awaiting.

## In an interview, mention…

- Fail-fast vs wait-for-all, and the different result shapes.
- The business question that decides it: is partial success valuable?
- Related combinators (`any`, `race`) and cancellation of in-flight work with `AbortController`.
