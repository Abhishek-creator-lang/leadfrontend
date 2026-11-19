## TL;DR

**`async`/`await`** is syntax built on promises. An **`async` function always returns a promise**, and **`await`** pauses that function (not the thread) until a promise settles, then **resumes with the value or throws the rejection**. This lets asynchronous code read like synchronous code, with ordinary **`try/catch`, loops and conditionals**. The usual mistakes are **accidentally serialising** independent work and **forgetting to await or handle errors**.

## Before and after

```js
// Promise chain
function loadProfile(id) {
  return fetch(`/api/users/${id}`)
    .then((r) => r.json())
    .then((user) => fetch(`/api/teams/${user.teamId}`))
    .then((r) => r.json())
    .catch((err) => { report(err); throw err; });
}

// async/await
async function loadProfile(id) {
  try {
    const user = await (await fetch(`/api/users/${id}`)).json();
    const team = await (await fetch(`/api/teams/${user.teamId}`)).json();
    return { user, team };
  } catch (err) {
    report(err);
    throw err;
  }
}
```

The `async` version keeps intermediate values in scope (`user` is still available when you have `team`), which is awkward with chains.

## How it works

- `return x` inside an `async` function fulfils its promise with `x`; `throw e` rejects it.
- `await p` subscribes to `p`, and the rest of the function continues as a **microtask** once `p` settles. Other code runs meanwhile.
- `await` on a non-promise value still yields once (it is wrapped in a resolved promise).

```js
async function f() {
  console.log('1');
  await null;
  console.log('3');
}
f();
console.log('2'); // order: 1, 2, 3
```

## Sequential vs parallel

```js
// Slow: second request waits for the first even though they're independent
const a = await getA();
const b = await getB();

// Fast: start both, then await
const [a2, b2] = await Promise.all([getA(), getB()]);
```

Use sequential awaits only when a step depends on the previous result.

## Loops

```js
for (const id of ids) await save(id);           // serial, intentionally
await Promise.all(ids.map((id) => save(id)));   // parallel
ids.forEach(async (id) => await save(id));      // ❌ nothing waits for these
for await (const chunk of stream) process(chunk); // async iterables
```

## Top-level await

In ES modules, `await` works at the top level:

```js
// config.js
export const config = await (await fetch('/config.json')).json();
```

Importers wait for this module to finish. That's handy, but it blocks the module graph, so avoid slow network calls in widely imported modules.

## Pitfalls

- **Forgetting `await`:** you get a pending promise instead of a value, and its rejection goes unhandled. Lint with `@typescript-eslint/no-floating-promises`.
- **`return await` inside `try`:** needed if you want the local `catch` to handle the rejection. Without `await`, the promise is returned and the error bypasses your `catch`.
- **Async functions in places expecting sync ones:** `useEffect(async () => …)` returns a promise instead of a cleanup function. Define an inner async function and call it.
- **`await` doesn't make code faster or parallel.** It only makes it readable. CPU-heavy work still blocks the thread.
- **Error stacks:** modern engines keep async stack traces through `await`, which is a debugging advantage over manual chains.

## In an interview, mention…

- It's promises under the hood: async functions return promises; `await` resumes in a microtask.
- Error handling with `try/catch/finally`, and the `return await` subtlety.
- Serial vs parallel awaiting and the `forEach` trap. Top-level await in modules.
