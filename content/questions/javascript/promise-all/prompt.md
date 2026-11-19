Implement `promiseAll(iterable)`, which behaves like [`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all). It takes an iterable of values (promises, thenables or plain values) and returns a promise that:

- **fulfills** with an array of all the fulfillment values, **in the same order as the input**, once every item has fulfilled, or
- **rejects** with the reason of the **first** item to reject.

```js
const slow = new Promise((r) => setTimeout(() => r('slow'), 50));
const fast = Promise.resolve('fast');

await promiseAll([slow, fast, 42]); // ['slow', 'fast', 42] (input order, not finish order)
await promiseAll([]); // []
await promiseAll([fast, Promise.reject(new Error('x'))]); // rejects with Error('x')
await promiseAll(new Set([1, 2])); // [1, 2] (any iterable works)
```

## Requirements

- Do not use `Promise.all`, `Promise.allSettled`, `Promise.any` or `Promise.race`. You may use `new Promise`, `Promise.resolve` and `.then`.
- Non-promise values count as already fulfilled. Thenables (objects with a `then` method) are adopted.
- An empty iterable fulfills with `[]`.
- If the argument is not iterable, the returned promise **rejects** with a `TypeError` (it does not throw synchronously).
- Later rejections or fulfillments after the result is settled are ignored.

## Follow-up

- Promise.all doesn't cancel the other operations when one fails. How would you add cancellation?
- How would you limit concurrency if the input were a list of task functions instead of promises?
