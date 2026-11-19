## TL;DR

A **callback** is a function you pass to other code so that it can **call you back later**, for example when a timer fires, an event happens or I/O completes. In asynchronous code, the caller **returns immediately** and the callback runs on a **later turn of the event loop**. Callbacks are the foundation that promises and `async`/`await` are built on, but used directly they lead to **nesting ("callback hell"), scattered error handling and inversion of control**.

## Synchronous vs asynchronous callbacks

```js
// Synchronous: runs before map returns
[1, 2, 3].map((n) => n * 2);

// Asynchronous: runs after the current code finishes
console.log('start');
setTimeout(() => console.log('timer'), 0);
button.addEventListener('click', () => console.log('clicked'));
console.log('end');
// start, end, timer (clicked whenever the user clicks)
```

The function itself is the same idea. What differs is **when** the receiving code invokes it.

## The Node.js error-first convention

```js
import { readFile } from 'node:fs';

readFile('config.json', 'utf8', (err, text) => {
  if (err) return handleError(err); // always check first
  const config = JSON.parse(text);
  start(config);
});
```

The first argument is an error (or `null`); results follow. This convention made error handling consistent before promises, and `util.promisify` relies on it to convert such APIs into promises.

## Problems with raw callbacks

**1. Callback hell:** sequential steps nest deeper and deeper.

```js
getUser(id, (err, user) => {
  if (err) return done(err);
  getOrders(user, (err, orders) => {
    if (err) return done(err);
    getInvoice(orders[0], (err, invoice) => {
      if (err) return done(err);
      done(null, invoice);
    });
  });
});
```

**2. Error handling is manual.** `try/catch` around the outer call cannot catch an error thrown inside a callback that runs later, because by then that stack frame is gone.

**3. Inversion of control.** You trust the other code to call your function **exactly once**, **asynchronously** and with the right arguments. A buggy library might call it twice, never, or sometimes synchronously ("releasing Zalgo"), creating ordering bugs.

**4. Composition is hard.** Running things in parallel and waiting for all of them, or adding timeouts and cancellation, needs hand-written counters and flags.

## The same flow with promises and async/await

```js
async function loadInvoice(id) {
  const user = await getUser(id);
  const orders = await getOrders(user);
  return getInvoice(orders[0]);
}
```

Promises guarantee a single settlement, always run reactions asynchronously and propagate errors to one `catch`.

## Where callbacks are still the right tool

- **Events that happen many times:** DOM listeners, `ResizeObserver`, WebSocket messages. A promise settles once, so it doesn't fit.
- **Synchronous higher-order functions:** `map`, `filter`, `sort` comparators.
- **Hooks/plugins:** `onSuccess`, render props, React's `useEffect` cleanup.

## Pitfalls

- Losing `this` when passing methods as callbacks (`setTimeout(obj.method, 0)`). Use an arrow function or `bind`.
- Forgetting to remove listener callbacks, causing leaks.
- Calling a callback both synchronously and asynchronously depending on a cache hit. Always be consistent (use `queueMicrotask` for the cached path).

## In an interview, mention…

- A callback is just a function argument; asynchrony comes from *when* it's invoked by the event loop.
- Error-first convention, callback hell, inversion of control and the Zalgo problem.
- Promises fix one-shot async results; callbacks/events remain right for repeated notifications.
