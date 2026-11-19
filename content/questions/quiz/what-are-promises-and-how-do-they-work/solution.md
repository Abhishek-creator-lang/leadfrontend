## TL;DR

A **Promise** is an object representing the **eventual result of an asynchronous operation**. It starts **pending** and settles **once**, either **fulfilled with a value** or **rejected with a reason**. You attach reactions with **`.then`, `.catch` and `.finally`**. Each returns a **new promise**, which enables **chaining** and **error propagation**. Reactions always run **asynchronously as microtasks**, even if the promise is already settled.

## Creating and consuming

```js
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${src}`));
    img.src = src;
  });
}

loadImage('/logo.png')
  .then((img) => document.body.append(img))
  .catch((err) => console.error(err))
  .finally(() => hideSpinner());
```

The executor function runs **synchronously** inside `new Promise`. If it throws, the promise rejects.

## Chaining rules

What you return from a `.then` handler decides the next promise:

```js
fetch('/api/user')
  .then((res) => res.json())          // return a promise → chain waits for it
  .then((user) => user.id)            // return a value → next promise fulfils with it
  .then((id) => { throw new Error('x'); }) // throw → next promise rejects
  .catch((err) => 'fallback')         // recover: returns a fulfilled promise
  .then((v) => console.log(v));       // 'fallback'
```

- Returning a **thenable** (anything with a `.then` method) adopts its state. This is called *resolving* with another promise.
- A rejection **skips** subsequent `.then` fulfilment handlers until it reaches a `.catch` (or the second argument of `.then`).
- `.finally` doesn't receive a value and passes the original result through, unless it throws.

## Timing

```js
console.log(1);
Promise.resolve().then(() => console.log(3));
console.log(2);
// 1, 2, 3
```

Reactions are queued as **microtasks**, which run after the current synchronous code and before the next task (timers, events). This guarantees consistent async behaviour: a handler never runs in the middle of your code.

## Useful static methods

| Method | Settles when |
|---|---|
| `Promise.all(list)` | All fulfil (rejects on the first rejection) |
| `Promise.allSettled(list)` | All settle, with `{status, value/reason}` results |
| `Promise.race(list)` | The first one settles |
| `Promise.any(list)` | The first one fulfils (rejects with `AggregateError` if all reject) |
| `Promise.resolve/reject(x)` | Immediately |
| `Promise.withResolvers()` (ES2024) | Returns `{ promise, resolve, reject }` for when resolution happens outside an executor |
| `Promise.try(fn)` (ES2025) | Runs `fn` and wraps sync throws or returns into a promise |

```js
const { promise, resolve } = Promise.withResolvers();
socket.addEventListener('open', resolve, { once: true });
await promise;
```

## Pitfalls

- **Forgetting to return** inside `.then`: the chain doesn't wait, and errors escape.
- **Unhandled rejections** are reported via the `unhandledrejection` event and in the console (and crash Node by default). Always end chains with error handling.
- **Nesting `.then` inside `.then`** recreates callback hell. Return and flatten.
- **Promises are eager and not cancellable.** The work starts on creation; use `AbortController` for cancellation.
- **The "explicit construction" anti-pattern:** wrapping an existing promise in `new Promise` adds bugs. Just return it.

## In an interview, mention…

- Three states, settled once, immutable result.
- `.then` returns a new promise; return values, thrown errors and returned promises drive the chain.
- Microtask scheduling, and that `async`/`await` is syntax on top of this same machinery.
