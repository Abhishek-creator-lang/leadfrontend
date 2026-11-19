Implement `promiseReject(reason)`, which behaves like [`Promise.reject`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject). It returns a new promise that is already **rejected** with `reason`.

```js
promiseReject(new Error('nope')).catch((e) => e.message); // 'nope'

const p = Promise.resolve('fine');
promiseReject(p).catch((reason) => reason === p); // true: the promise itself is the reason

const thenable = { then: (resolve) => resolve('ignored') };
promiseReject(thenable).catch((reason) => reason === thenable); // true
```

## Requirements

- Do not call the native `Promise.reject`. You may use `new Promise`.
- Always return a **new** promise, even if `reason` is itself a promise.
- `reason` is used **exactly as given**. Promises and thenables are **not** unwrapped or adopted, and their `then` method is never called.
- Any value is allowed as a reason, including `undefined`.

## Follow-up

- Why is the asymmetry between `Promise.resolve` (adopts) and `Promise.reject` (doesn't) intentional?
- Why should you reject with `Error` objects rather than strings?
