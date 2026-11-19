Implement `promiseResolve(value)`, which behaves like [`Promise.resolve`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve).

```js
await promiseResolve(42); // 42

const p = Promise.resolve('x');
promiseResolve(p) === p; // true (native promises are returned as-is)

const thenable = {
  then(onFulfilled) {
    onFulfilled('adopted');
  },
};
await promiseResolve(thenable); // 'adopted'
```

## Requirements

- Do not call the native `Promise.resolve`. You may use `new Promise`.
- If `value` is a native promise whose `constructor` is exactly `Promise`, return **the same object**.
- Any other promise, for example an instance of a `Promise` subclass, is wrapped in a new native promise that follows it.
- **Thenables** (any object or function with a callable `then` property) are adopted. The returned promise follows whatever the thenable does:
  - It fulfills or rejects when the thenable calls its first or second callback. Only the first call counts.
  - If calling `then` throws before either callback was called, the promise rejects with that error.
  - If **reading** the `then` property throws (a throwing getter), the promise rejects with that error.
  - `then` is called **asynchronously**, in a later microtask, not during `promiseResolve`.
- Any other value fulfills the returned promise.

## Follow-up

- Why does `Promise.resolve` adopt thenables at all, instead of only real promises?
- How many microtask ticks does adopting a promise cost compared to `await`-ing a plain value?
