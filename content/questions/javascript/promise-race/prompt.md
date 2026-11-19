Implement `promiseRace(iterable)`, which behaves like [`Promise.race`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race). It returns a promise that settles **the same way as the first input to settle**: it fulfills if that input fulfilled, and rejects if it rejected.

```js
const fast = new Promise((resolve) => setTimeout(() => resolve('fast'), 10));
const slow = new Promise((resolve) => setTimeout(() => resolve('slow'), 50));
await promiseRace([slow, fast]); // 'fast'

const failsFirst = new Promise((_, reject) => setTimeout(() => reject(new Error('boom')), 5));
await promiseRace([slow, failsFirst]); // rejects with Error('boom')

promiseRace([]); // stays pending forever
```

## Requirements

- Do not use the native combinators (`all`, `allSettled`, `any`, `race`). `new Promise`, `Promise.resolve` and `.then` are fine.
- Accept any iterable. Plain values and already-settled promises still settle the result **asynchronously**, and the first one in iteration order wins when several are already settled.
- Thenables are adopted.
- An empty iterable returns a promise that **never settles**.
- A non-iterable argument makes the returned promise reject with a `TypeError`.

## Follow-up

- Use `promiseRace` to build a timeout helper. What does it fail to clean up?
