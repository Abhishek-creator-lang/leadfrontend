## TL;DR

When an error is thrown and not caught, it **propagates up the call stack**: each function frame is unwound until a `try/catch` (or `finally`) is found. If none is found, it becomes an **uncaught error** handled by the host (logged, `window.onerror`, process crash in Node). With **promises**, propagation follows the **promise chain** instead of the call stack: a rejection skips `.then` handlers until it reaches a `.catch`, and `await` rethrows it into the surrounding `async` function. An unhandled rejection fires **`unhandledrejection`**.

## Synchronous propagation

```js
function parse(raw) { return JSON.parse(raw); }         // throws SyntaxError
function load(raw)  { const data = parse(raw); return data.items; }
function render(raw) {
  try {
    return load(raw);
  } catch (err) {
    console.error('render failed:', err.message);       // caught here
    return [];
  }
}
render('{oops'); // parse → load → render: the stack unwinds two frames
```

Code after the throw in `parse` and `load` never runs. `finally` blocks along the way **do** run while the stack unwinds.

## Asynchronous propagation

```js
fetchUser()
  .then((u) => fetchOrders(u.id))   // if fetchUser rejects, this is skipped
  .then(renderOrders)               // also skipped
  .catch((err) => showError(err))   // handles a rejection from any step above
  .then(() => console.log('chain continues after recovery'));
```

With `async`/`await`, it reads like sync code:

```js
async function page() {
  const user = await fetchUser();        // rejection is thrown here
  const orders = await fetchOrders(user.id);
  return orders;
}

page().catch(report); // the async function's returned promise rejects
```

The call stack **does not** connect async boundaries: an error inside a `setTimeout` callback or event listener propagates only up that callback's own stack, never to the code that scheduled it.

```js
try {
  button.addEventListener('click', () => { throw new Error('x'); });
} catch { /* useless: the listener runs later, on its own stack */ }
```

## Where errors end up if nobody catches them

| Situation | Browser | Node |
|---|---|---|
| Uncaught sync error | `error` event on `window`, logged to console; the current task ends, the page keeps running | `uncaughtException`, process exits by default |
| Unhandled rejection | `unhandledrejection` event | `unhandledRejection`, process exits by default (Node 15+) |
| Error in event listener | Reported, other listeners still run | n/a |

```js
window.addEventListener('error', (e) => report(e.error));
window.addEventListener('unhandledrejection', (e) => report(e.reason));
```

## Controlling propagation deliberately

- **Catch and recover** where you have a sensible fallback.
- **Catch, add context, rethrow**: `throw new Error('Saving order failed', { cause: err })`. The stack of causes reads like a story in your logs.
- **Let it bubble** to a boundary: a route-level handler, a React error boundary, a request middleware. Most functions shouldn't catch at all.
- **Aggregate** parallel failures: `Promise.all` rejects with the first error; `Promise.allSettled` collects them all; `Promise.any` rejects with an `AggregateError`.

## Pitfalls

- Forgetting `await` (or `return`) on a promise breaks the chain, so its rejection becomes unhandled instead of propagating.
- A `.catch` that doesn't rethrow turns a failure into success (resolved with `undefined`) for everything downstream.
- `forEach` with an async callback doesn't propagate rejections to the caller; use `for…of` with `await` or `Promise.all(map(...))`.

## In an interview, mention…

- Stack unwinding for sync errors, chain-based propagation for promises.
- Async callbacks start a fresh stack, so `try/catch` around scheduling code doesn't help.
- Global handlers as the last line, boundaries as the strategy, and `cause` for context.
