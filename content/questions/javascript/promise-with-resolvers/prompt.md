Implement `promiseWithResolvers()`, which behaves like [`Promise.withResolvers`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers) (ES2024). It returns an object `{ promise, resolve, reject }`: a new pending promise plus the two functions that settle it, so code **outside** the executor can settle it later.

```js
const { promise, resolve, reject } = promiseWithResolvers();

button.addEventListener('click', () => resolve('clicked'), { once: true });
setTimeout(() => reject(new Error('Too slow')), 5000);

await promise; // 'clicked' if the user clicked within 5 seconds
```

## Requirements

- Do not use the native `Promise.withResolvers`.
- Every call returns a **new** promise with its own `resolve`/`reject`.
- `resolve` and `reject` behave exactly like the ones passed to a `Promise` executor: only the first call has any effect, and `resolve` adopts promises and thenables.
- The returned object is a plain object with exactly the keys `promise`, `resolve` and `reject`.

## Follow-up

- What problem does this solve compared to `new Promise(executor)`? Name two real use cases.
- What are the risks of passing `resolve`/`reject` around freely?
