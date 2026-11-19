Implement `makeCounter(initial = 0, step = 1)`. It returns a function `counter`. Each call to `counter()` returns the current value and then advances it by `step`.

```js
const counter = makeCounter();
counter(); // 0
counter(); // 1
counter(); // 2

const countdown = makeCounter(10, -5);
countdown(); // 10
countdown(); // 5
countdown(); // 0

countdown.reset();
countdown(); // 10
```

## Requirements

- The first call returns `initial`. Every later call returns the previous value plus `step`.
- `initial` defaults to `0` and `step` defaults to `1`.
- Counters are **independent**: each call to `makeCounter` has its own state.
- The state must be **private**. It cannot be read or changed except through the counter (no global variables, and no public `count` property).
- `counter.reset()` puts the counter back to `initial`, so the next call returns `initial` again.

## Follow-up

- Rewrite it as a class with private fields (`#count`). What changes?
- Why does a closure keep `count` alive after `makeCounter` has returned?
- How is this pattern related to React's `useState`?
