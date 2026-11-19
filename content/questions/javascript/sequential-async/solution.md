## Approach 1: `async` / `await`

```js
async function series(tasks) {
  const results = [];
  let previous;
  for (const task of tasks) {
    previous = await task(previous);
    results.push(previous);
  }
  return results;
}
```

`await` inside a `for...of` loop is exactly "one at a time": the loop body can't move on until the current promise settles. If a task rejects, `await` throws, the loop stops and the `async` function's promise rejects. Because the function is `async`, even a synchronous throw from the first task becomes a rejection, which satisfies the "never throws synchronously" requirement for free.

The reference solution uses this version because it is the clearest.

## Approach 2: `reduce` over a promise chain

```js
function series(tasks) {
  const results = [];
  return tasks
    .reduce(
      (chain, task) => chain.then((prev) => task(prev)).then((value) => {
        results.push(value);
        return value;
      }),
      Promise.resolve(undefined)
    )
    .then(() => results);
}
```

Each step is attached to the previous promise with `.then`, so the chain naturally serialises. A rejection skips every later `.then` callback (none of them have a rejection handler), so the remaining tasks never run. Calling `task` inside `.then` also converts a synchronous throw into a rejection.

This is the pre-`async` idiom and still worth knowing: it shows you understand that **`then` callbacks are only called after the previous promise settles**.

## `series` vs `Promise.all`

`Promise.all(tasks.map((t) => t()))` calls every task **immediately**, so they run concurrently, and it can't pass one result to the next. Use `series` when:

- Each step depends on the previous result (log in, then fetch with the token).
- Order of side effects matters (database migrations, applying patches).
- The other side can only handle one request at a time (a rate-limited API, a printer, a serial device).

Otherwise, prefer concurrency. Serialising independent requests is a common performance bug: five 200ms requests take one second instead of 200ms.

## Complexity

O(n) time and space for results. Wall-clock time is the **sum** of task durations.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `tasks.forEach(async (t) => await t())` | `forEach` ignores the returned promises, so everything runs in parallel and `series` resolves at once |
| `tasks.map((t) => t())` and then awaiting in a loop | Every task has already started; you're only awaiting in order |
| `reduce` with `chain.then(task())` | Calls `task` immediately while building the chain |
| Not stopping after a rejection | Later steps run against a failed state |

## Real-world connection

- Database migration runners (Knex, Prisma) apply migrations strictly in series.
- Express and Koa middleware are a series of async steps, each deciding whether to continue (see *Middlewares*).
- Redux-saga and Redux-observable flows often model "do A, then B with the result" chains like this.
- In the browser, writing chunks of a large upload in order, or replaying an offline queue of mutations in the order the user made them, needs strict serialisation.

## Follow-ups

- **Collect errors instead of stopping:** wrap each step in `try/catch` and record `{ status, value | reason }`.
- **Cancellation:** check an `AbortSignal` between steps.
- **Bounded concurrency:** that's the generalisation. Series is concurrency 1 (see *Map Async with Limit*).
