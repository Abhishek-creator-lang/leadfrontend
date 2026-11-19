Implement `promiseAllSettled(iterable)`, which behaves like [`Promise.allSettled`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled). It returns a promise that **always fulfills** once every input has settled. The fulfillment value is an array of outcome objects, in input order:

- `{ status: 'fulfilled', value }` for items that fulfilled
- `{ status: 'rejected', reason }` for items that rejected

```js
const results = await promiseAllSettled([
  Promise.resolve(1),
  Promise.reject(new Error('nope')),
  'plain',
]);
// [
//   { status: 'fulfilled', value: 1 },
//   { status: 'rejected', reason: Error('nope') },
//   { status: 'fulfilled', value: 'plain' },
// ]

await promiseAllSettled([]); // []
```

## Requirements

- Do not use any of the native `Promise` combinators (`all`, `allSettled`, `any`, `race`). `new Promise`, `Promise.resolve` and `.then` are fine.
- Accept any iterable. Plain values count as fulfilled, and thenables are adopted.
- Keep input order regardless of completion order.
- The outcome objects contain **only** `status` plus `value` or `reason`.
- An empty iterable fulfills with `[]`. A non-iterable argument makes the returned promise reject with a `TypeError`.

## Follow-up

- When would you choose `allSettled` over `all` in a real UI?
- How would you show partial results while the slow items are still pending?
