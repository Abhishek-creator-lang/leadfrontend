Implement `setCancellableTimeout(callback, delay, ...args)`. It works like `setTimeout`, but instead of a timer id it returns a **cancel function**. Calling the cancel function before the timer fires stops `callback` from running.

```js
const cancel = setCancellableTimeout((name) => console.log(`Hi ${name}`), 100, 'Sam');
// ...later, if we change our mind before 100ms pass:
cancel(); // nothing is logged
```

## Requirements

- Run `callback(...args)` once after `delay` ms, unless cancelled first. `delay` defaults to `0`.
- Return a function that cancels the pending call.
- Calling the cancel function **after** the callback ran, or more than once, is a harmless no-op.

## Follow-up

- Why is returning a cancel function often nicer than returning an id?
- How does this map onto React's `useEffect` cleanup?
