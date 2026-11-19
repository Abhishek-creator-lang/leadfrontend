Implement `promiseAny(iterable)`, which behaves like [`Promise.any`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any). It returns a promise that:

- **fulfills** with the value of the **first** item to fulfill, ignoring rejections along the way, or
- **rejects** with an [`AggregateError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError) if **every** item rejects. Its `errors` property holds all the rejection reasons **in input order**.

```js
const mirrorA = new Promise((_, reject) => setTimeout(() => reject(new Error('A down')), 10));
const mirrorB = new Promise((resolve) => setTimeout(() => resolve('B'), 30));

await promiseAny([mirrorA, mirrorB]); // 'B'

try {
  await promiseAny([Promise.reject(1), Promise.reject(2)]);
} catch (e) {
  e instanceof AggregateError; // true
  e.errors; // [1, 2]
}

await promiseAny([]); // rejects with an AggregateError whose errors are []
```

## Requirements

- Do not use the native combinators (`all`, `allSettled`, `any`, `race`). `new Promise`, `Promise.resolve`, `.then` and the global `AggregateError` constructor are fine.
- Accept any iterable. Plain values count as fulfilled, and thenables are adopted.
- An **empty** iterable rejects immediately with an `AggregateError` (empty `errors`).
- A non-iterable argument makes the returned promise reject with a `TypeError`.

## Follow-up

- `any` vs `race`: what is the difference, and when would you use each?
- How would you cancel the losing requests once one succeeds?
