Implement `mySetInterval(callback, delay, ...args)` and `myClearInterval(id)` **using only `setTimeout` and `clearTimeout`**. Together they should behave like the native `setInterval` / `clearInterval` pair.

`mySetInterval` is the default export and `myClearInterval` is a named export of the same module.

```js
import mySetInterval, { myClearInterval } from './index';

let count = 0;
const id = mySetInterval((label) => {
  count++;
  console.log(label, count);
  if (count === 3) myClearInterval(id);
}, 100, 'tick');
// tick 1 (~100ms), tick 2 (~200ms), tick 3 (~300ms), then stops
```

## Requirements

- Call `callback(...args)` every `delay` ms until cleared. `delay` defaults to `0`.
- `mySetInterval` returns an id. Each call returns a **different** id, and intervals are independent of each other.
- `myClearInterval(id)` stops all future calls for that interval, including when called **from inside its own callback**.
- `myClearInterval` with an unknown or already-cleared id does nothing and doesn't throw.
- Don't use `setInterval` or `clearInterval`.

## Follow-up

- Chained timeouts drift over time. Why, and how would you correct for it?
- When is a chained `setTimeout` actually *better* than `setInterval`?
